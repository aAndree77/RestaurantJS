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

// GET - Obține sau creează chatul general și returnează lista de admini
export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    // Verifică/creează chatul general
    let generalChat = await prisma.chatGroup.findFirst({
      where: { type: "general" }
    })

    if (!generalChat) {
      // Creează chatul general
      generalChat = await prisma.chatGroup.create({
        data: {
          name: "Chat General",
          type: "general",
          createdBy: admin.id
        }
      })
    }

    // Asigură-te că admin-ul curent e membru al chat-ului general
    await prisma.chatMember.upsert({
      where: {
        groupId_adminId: { groupId: generalChat.id, adminId: admin.id }
      },
      create: { groupId: generalChat.id, adminId: admin.id },
      update: {}
    })

    // Adaugă toți adminii la chatul general
    const allAdmins = await prisma.admin.findMany({
      select: { id: true, name: true, email: true, image: true, role: true }
    })

    // Adaugă super admin hardcodat la lista de admini
    const superAdminExists = allAdmins.some(a => a.email === SUPER_ADMIN_EMAIL)
    
    for (const a of allAdmins) {
      await prisma.chatMember.upsert({
        where: {
          groupId_adminId: { groupId: generalChat.id, adminId: a.id }
        },
        create: { groupId: generalChat.id, adminId: a.id },
        update: {}
      })
    }

    return NextResponse.json({
      generalChatId: generalChat.id,
      admins: allAdmins.filter(a => a.id !== admin.id),
      currentAdmin: admin
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
