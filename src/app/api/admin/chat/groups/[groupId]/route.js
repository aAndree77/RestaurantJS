export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

async function getCurrentAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  
  if (session.user.email === SUPER_ADMIN_EMAIL) {
    let admin = await prisma.admin.findUnique({
      where: { email: SUPER_ADMIN_EMAIL }
    })
    if (!admin) {
      admin = await prisma.admin.create({
        data: {
          email: SUPER_ADMIN_EMAIL,
          name: session.user.name,
          image: session.user.image,
          role: "super_admin",
          authType: "google"
        }
      })
    }
    return admin
  }
  
  return await prisma.admin.findUnique({
    where: { email: session.user.email }
  })
}

// GET - Obține detalii grup și membri
export async function GET(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { groupId } = await params

    // Verifică dacă admin-ul e membru
    const membership = await prisma.chatMember.findUnique({
      where: {
        groupId_adminId: { groupId, adminId: admin.id }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Nu ești membru al acestui grup" }, { status: 403 })
    }

    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            admin: { select: { id: true, name: true, email: true, image: true, role: true } }
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: "Grup negăsit" }, { status: 404 })
    }

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
      createdAt: group.createdAt
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PATCH - Actualizează grup (doar super admin)
export async function PATCH(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Neautorizat" }, { status: 403 })
    }

    const { groupId } = await params
    const { name, image, addMembers, removeMembers } = await request.json()

    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId }
    })

    if (!group || group.type !== "group") {
      return NextResponse.json({ error: "Grup negăsit sau nu poate fi modificat" }, { status: 404 })
    }

    // Actualizează numele și/sau imaginea
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (image !== undefined) updateData.image = image
    
    if (Object.keys(updateData).length > 0) {
      await prisma.chatGroup.update({
        where: { id: groupId },
        data: updateData
      })
    }

    // Adaugă membri noi
    if (addMembers?.length > 0) {
      for (const memberId of addMembers) {
        await prisma.chatMember.upsert({
          where: {
            groupId_adminId: { groupId, adminId: memberId }
          },
          create: { groupId, adminId: memberId },
          update: {}
        })
      }
    }

    // Elimină membri
    if (removeMembers?.length > 0) {
      await prisma.chatMember.deleteMany({
        where: {
          groupId,
          adminId: { in: removeMembers }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 })
  }
}

// DELETE - Șterge grup (doar super admin)
export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin || admin.role !== "super_admin") {
      return NextResponse.json({ error: "Neautorizat" }, { status: 403 })
    }

    const { groupId } = await params

    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: "Grup negăsit" }, { status: 404 })
    }

    // Nu permite ștergerea chat-ului general
    if (group.type === "general") {
      return NextResponse.json({ error: "Nu poți șterge chatul general" }, { status: 400 })
    }

    await prisma.chatGroup.delete({
      where: { id: groupId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 })
  }
}
