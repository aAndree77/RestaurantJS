export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

// Obține admin-ul curent din baza de date
async function getCurrentAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  
  // Super admin hardcodat
  if (session.user.email === SUPER_ADMIN_EMAIL) {
    const admin = await prisma.admin.findUnique({
      where: { email: SUPER_ADMIN_EMAIL }
    })
    if (admin) return admin
    
    // Creează super admin dacă nu există
    return await prisma.admin.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        name: session.user.name,
        image: session.user.image,
        role: "super_admin",
        authType: "google"
      }
    })
  }
  
  return await prisma.admin.findUnique({
    where: { email: session.user.email }
  })
}

// GET - Obține toate grupurile/conversațiile utilizatorului
export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    // Obține toate grupurile în care este membru admin-ul curent
    const memberships = await prisma.chatMember.findMany({
      where: { adminId: admin.id },
      include: {
        group: {
          include: {
            members: {
              include: {
                admin: {
                  select: { id: true, name: true, email: true, image: true }
                }
              }
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                sender: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    })

    // Transformă datele pentru frontend
    const groups = memberships.map(m => {
      const group = m.group
      const lastMessage = group.messages[0]
      
      // Pentru chat individual, setează numele celuilalt participant
      let displayName = group.name
      if (group.type === "individual") {
        const otherMember = group.members.find(member => member.adminId !== admin.id)
        displayName = otherMember?.admin?.name || otherMember?.admin?.email || "Conversație"
      }
      
      return {
        id: group.id,
        name: displayName,
        type: group.type,
        image: group.image,
        members: group.members.map(m => m.admin),
        lastMessage: lastMessage ? {
          content: lastMessage.isDeleted ? "Mesaj șters" : lastMessage.content,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt,
          hasImage: !!lastMessage.image
        } : null,
        lastRead: m.lastRead,
        createdAt: group.createdAt
      }
    })

    // Sortează după ultimul mesaj
    groups.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt
      const bTime = b.lastMessage?.createdAt || b.createdAt
      return new Date(bTime) - new Date(aTime)
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Creează un grup nou sau conversație individuală
export async function POST(request) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { type, name, image, memberIds } = await request.json()

    // Doar super admin poate crea grupuri
    if (type === "group" && admin.role !== "super_admin") {
      return NextResponse.json({ error: "Doar Super Admin poate crea grupuri" }, { status: 403 })
    }

    // Pentru conversații individuale, verifică dacă există deja
    if (type === "individual" && memberIds?.length === 1) {
      const existingChat = await prisma.chatGroup.findFirst({
        where: {
          type: "individual",
          AND: [
            { members: { some: { adminId: admin.id } } },
            { members: { some: { adminId: memberIds[0] } } }
          ]
        },
        include: {
          members: {
            include: {
              admin: { select: { id: true, name: true, email: true, image: true } }
            }
          }
        }
      })

      if (existingChat) {
        const otherMember = existingChat.members.find(m => m.adminId !== admin.id)
        return NextResponse.json({
          id: existingChat.id,
          name: otherMember?.admin?.name || otherMember?.admin?.email,
          type: existingChat.type,
          image: existingChat.image,
          members: existingChat.members.map(m => m.admin),
          lastMessage: null,
          createdAt: existingChat.createdAt
        })
      }
    }

    // Creează grupul
    const group = await prisma.chatGroup.create({
      data: {
        name: type === "group" ? name : null,
        image: type === "group" ? image : null,
        type,
        createdBy: admin.id,
        members: {
          create: [
            { adminId: admin.id },
            ...(memberIds || []).map(id => ({ adminId: id }))
          ]
        }
      },
      include: {
        members: {
          include: {
            admin: { select: { id: true, name: true, email: true, image: true } }
          }
        }
      }
    })

    // Pentru chat individual, returnează numele celuilalt participant
    let displayName = group.name
    if (group.type === "individual") {
      const otherMember = group.members.find(m => m.adminId !== admin.id)
      displayName = otherMember?.admin?.name || otherMember?.admin?.email
    }

    return NextResponse.json({
      id: group.id,
      name: displayName,
      type: group.type,
      image: group.image,
      members: group.members.map(m => m.admin),
      lastMessage: null,
      createdAt: group.createdAt
    })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Eroare la creare" }, { status: 500 })
  }
}
