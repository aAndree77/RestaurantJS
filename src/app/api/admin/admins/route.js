export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

// Middleware pentru verificare admin
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

// GET - Lista adminilor
export async function GET() {
  try {
    const currentAdmin = await checkAdmin()
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Adaugă admin nou
export async function POST(request) {
  try {
    const currentAdmin = await checkAdmin()
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { email, name, password, authType = "google", role = "admin" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email-ul este obligatoriu" }, { status: 400 })
    }

    // Validare pentru autentificare cu credentials
    if (authType === "credentials") {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Parola trebuie să aibă minim 6 caractere" }, { status: 400 })
      }
    }

    // Verifică dacă există deja
    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Acest admin există deja" }, { status: 400 })
    }

    // Hash parola dacă este cazul
    let hashedPassword = null
    if (authType === "credentials" && password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const admin = await prisma.admin.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        authType,
        role: role.toLowerCase()
      }
    })

    // Nu returnăm parola
    const { password: _, ...adminWithoutPassword } = admin
    return NextResponse.json(adminWithoutPassword)
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ error: "Eroare la crearea adminului" }, { status: 500 })
  }
}

// DELETE - Șterge admin
export async function DELETE(request) {
  try {
    const currentAdmin = await checkAdmin()
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID lipsă" }, { status: 400 })
    }

    await prisma.admin.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ error: "Eroare la ștergerea adminului" }, { status: 500 })
  }
}
