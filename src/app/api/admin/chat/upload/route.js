export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

async function getCurrentAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  
  if (session.user.email === SUPER_ADMIN_EMAIL) {
    return await prisma.admin.findUnique({
      where: { email: SUPER_ADMIN_EMAIL }
    })
  }
  
  return await prisma.admin.findUnique({
    where: { email: session.user.email }
  })
}

// POST - Upload imagine pentru chat
export async function POST(request) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "Niciun fișier uploadat" }, { status: 400 })
    }

    // Verifică tipul fișierului
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format invalid. Acceptăm: JPG, PNG, GIF, WEBP" }, { status: 400 })
    }

    // Verifică dimensiunea (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fișierul este prea mare (max 5MB)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Creează directorul dacă nu există
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chat")
    await mkdir(uploadDir, { recursive: true })

    // Generează nume unic
    const ext = file.name.split(".").pop()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    await writeFile(filePath, buffer)

    const url = `/uploads/chat/${uniqueName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading:", error)
    return NextResponse.json({ error: "Eroare la upload" }, { status: 500 })
  }
}
