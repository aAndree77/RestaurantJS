import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

// Funcție helper pentru verificare super admin
async function checkSuperAdmin(email) {
  if (email === SUPER_ADMIN_EMAIL) return true
  
  const admin = await prisma.admin.findUnique({
    where: { email }
  })
  
  return admin?.role === "super_admin"
}

// GET - Obține un utilizator specific
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    if (!await checkSuperAdmin(session.user.email)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilizator negăsit" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Eroare la obținerea utilizatorului" },
      { status: 500 }
    )
  }
}

// PATCH - Actualizează rolul utilizatorului
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    if (!await checkSuperAdmin(session.user.email)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const body = await request.json()
    const { role } = body

    // Validează rolul
    const validRoles = ["user", "banned"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rol invalid" },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Eroare la actualizarea utilizatorului" },
      { status: 500 }
    )
  }
}

// DELETE - Șterge un utilizator
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    if (!await checkSuperAdmin(session.user.email)) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    // Verifică dacă utilizatorul există
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilizator negăsit" }, { status: 404 })
    }

    // Șterge utilizatorul
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Eroare la ștergerea utilizatorului" },
      { status: 500 }
    )
  }
}
