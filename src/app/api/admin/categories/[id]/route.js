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

// GET - Obține o categorie
export async function GET(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menuItems: true,
        _count: {
          select: { menuItems: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Categorie negăsită" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PATCH - Actualizează categorie
export async function PATCH(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params
    const { name, icon, image } = await request.json()

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(icon !== undefined && { icon }),
        ...(image !== undefined && { image })
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 })
  }
}

// DELETE - Șterge categorie
export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin || admin.role === "MODERATOR") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    // Verifică dacă are produse
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { menuItems: true } } }
    })

    if (category?._count?.menuItems > 0) {
      // Setează produsele fără categorie
      await prisma.menuItem.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      })
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 })
  }
}
