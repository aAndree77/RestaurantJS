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

// PATCH - Editează mesaj
export async function PATCH(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { messageId } = await params
    const { content } = await request.json()

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: "Mesaj negăsit" }, { status: 404 })
    }

    // Doar expeditorul poate edita mesajul
    if (message.senderId !== admin.id) {
      return NextResponse.json({ error: "Poți edita doar mesajele tale" }, { status: 403 })
    }

    // Verifică dacă au trecut mai mult de 5 minute
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (message.createdAt < fiveMinutesAgo) {
      return NextResponse.json({ error: "Poți edita mesajele doar în primele 5 minute" }, { status: 400 })
    }

    if (message.isDeleted) {
      return NextResponse.json({ error: "Nu poți edita un mesaj șters" }, { status: 400 })
    }

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error editing message:", error)
    return NextResponse.json({ error: "Eroare la editare" }, { status: 500 })
  }
}

// DELETE - Șterge mesaj (soft delete)
export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { messageId } = await params

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      return NextResponse.json({ error: "Mesaj negăsit" }, { status: 404 })
    }

    // Doar expeditorul poate șterge mesajul
    if (message.senderId !== admin.id) {
      return NextResponse.json({ error: "Poți șterge doar mesajele tale" }, { status: 403 })
    }

    // Verifică dacă au trecut mai mult de 5 minute
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    if (message.createdAt < fiveMinutesAgo) {
      return NextResponse.json({ error: "Poți șterge mesajele doar în primele 5 minute" }, { status: 400 })
    }

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: null,
        image: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 })
  }
}
