import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  
  if (session.user.email === SUPER_ADMIN_EMAIL) {
    return { role: "SUPER_ADMIN", email: session.user.email }
  }
  
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email }
  })
  
  return admin
}

// GET - Detalii comandă
export async function GET(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: "Comandă negăsită" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PATCH - Actualizează status comandă
export async function PATCH(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { orderId } = await params
    const body = await request.json()
    const { status, estimatedTime, queuePosition } = body

    const updateData = {}

    // Validare status
    if (status) {
      const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERING", "DELIVERED", "CANCELLED"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Status invalid" }, { status: 400 })
      }
      updateData.status = status
      
      // Când statusul nu mai e PENDING, resetăm queuePosition
      if (status !== "PENDING") {
        updateData.queuePosition = null
      }
    }

    // Adaugă timp estimat dacă e furnizat
    if (estimatedTime !== undefined) {
      updateData.estimatedTime = estimatedTime
    }

    // Adaugă poziția în coadă dacă e furnizată
    if (queuePosition !== undefined) {
      updateData.queuePosition = queuePosition
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 })
  }
}

// DELETE - Șterge comandă
export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin || admin.role === "MODERATOR") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { orderId } = await params

    await prisma.order.delete({
      where: { id: orderId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 })
  }
}
