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

// GET - Obține mesajele dintr-un grup
export async function GET(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { groupId } = await params
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = parseInt(searchParams.get("limit") || "50")

    // Verifică dacă admin-ul e membru
    const membership = await prisma.chatMember.findUnique({
      where: {
        groupId_adminId: { groupId, adminId: admin.id }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Nu ești membru al acestui grup" }, { status: 403 })
    }

    // Actualizează lastRead
    await prisma.chatMember.update({
      where: {
        groupId_adminId: { groupId, adminId: admin.id }
      },
      data: { lastRead: new Date() }
    })

    // Obține mesajele
    const messages = await prisma.chatMessage.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1
      }),
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    const hasMore = messages.length > limit
    const data = hasMore ? messages.slice(0, -1) : messages

    return NextResponse.json({
      messages: data.reverse(),
      nextCursor: hasMore ? data[0]?.id : null
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Trimite un mesaj
export async function POST(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { groupId } = await params
    const { content, image } = await request.json()

    if (!content && !image) {
      return NextResponse.json({ error: "Mesajul trebuie să conțină text sau imagine" }, { status: 400 })
    }

    // Verifică dacă admin-ul e membru
    const membership = await prisma.chatMember.findUnique({
      where: {
        groupId_adminId: { groupId, adminId: admin.id }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Nu ești membru al acestui grup" }, { status: 403 })
    }

    // Creează mesajul
    const message = await prisma.chatMessage.create({
      data: {
        groupId,
        senderId: admin.id,
        content,
        image
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    // Actualizează timestamp-ul grupului
    await prisma.chatGroup.update({
      where: { id: groupId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Eroare la trimitere" }, { status: 500 })
  }
}
