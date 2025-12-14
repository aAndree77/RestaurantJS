export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

async function checkSuperAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.email === SUPER_ADMIN_EMAIL
}

// GET - Obține un admin
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { id } = await params

    const admin = await prisma.admin.findUnique({
      where: { id }
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin negăsit" }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PATCH - Actualizează un admin
export async function PATCH(request, { params }) {
  try {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Doar Super Admin poate modifica admini" }, { status: 403 })
    }

    const { id } = await params
    const { role, name } = await request.json()

    // Nu permite setarea ca super_admin
    if (role === "super_admin") {
      return NextResponse.json({ error: "Nu poți seta acest rol" }, { status: 400 })
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(name && { name })
      }
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la actualizare" }, { status: 500 })
  }
}

// DELETE - Șterge un admin
export async function DELETE(request, { params }) {
  try {
    const isSuperAdmin = await checkSuperAdmin()
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Doar Super Admin poate șterge admini" }, { status: 403 })
    }

    const { id } = await params

    await prisma.admin.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 })
  }
}
