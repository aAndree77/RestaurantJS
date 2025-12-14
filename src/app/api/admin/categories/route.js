export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  
  if (session.user.email === SUPER_ADMIN_EMAIL) {
    return { role: "super_admin", email: session.user.email }
  }
  
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email }
  })
  
  return admin
}

// Verifică dacă adminul poate modifica (nu e moderator)
function canModify(admin) {
  return admin && admin.role !== "moderator"
}

// GET - Lista categoriilor
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Creează categorie nouă
export async function POST(request) {
  try {
    const admin = await checkAdmin()
    if (!canModify(admin)) {
      return NextResponse.json({ error: "Acces interzis - doar adminii pot modifica categorii" }, { status: 403 })
    }
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { name, icon, image, color, order } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Numele este obligatoriu" }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: icon || "🍽️",
        image: image || null,
        color: color || "bg-gray-500",
        order: order || 0
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Eroare la crearea categoriei" }, { status: 500 })
  }
}

// PATCH - Actualizează categorie
export async function PATCH(request) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id, name, color, order } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID lipsă" }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(order !== undefined && { order })
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Eroare la actualizarea categoriei" }, { status: 500 })
  }
}

// DELETE - Șterge categorie
export async function DELETE(request) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID lipsă" }, { status: 400 })
    }

    // Verifică dacă are produse
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { menuItems: true } } }
    })

    if (category?._count?.menuItems > 0) {
      return NextResponse.json({ 
        error: `Nu poți șterge categoria. Există ${category._count.menuItems} produse asociate.` 
      }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Eroare la ștergerea categoriei" }, { status: 500 })
  }
}
