export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"

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

// GET - Lista produselor (admin)
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const products = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Creează produs nou cu imagine
export async function POST(request) {
  try {
    const admin = await checkAdmin()
    if (!canModify(admin)) {
      return NextResponse.json({ error: "Acces interzis - doar adminii pot modifica produse" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name")
    const description = formData.get("description")
    const price = parseFloat(formData.get("price"))
    const categoryId = formData.get("categoryId")
    const available = formData.get("available") === "true"
    const imageFile = formData.get("image")

    if (!name || !description || !price || !categoryId) {
      return NextResponse.json({ error: "Toate câmpurile sunt obligatorii" }, { status: 400 })
    }

    let imagePath = "/images/default-food.jpg"

    // Procesează imaginea dacă există
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Creează directorul dacă nu există
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
      await mkdir(uploadDir, { recursive: true })

      // Generează nume unic
      const timestamp = Date.now()
      const fileName = `${timestamp}-${name.toLowerCase().replace(/\s+/g, "-")}.webp`
      const filePath = path.join(uploadDir, fileName)

      // Procesează și optimizează imaginea cu sharp
      await sharp(buffer)
        .resize(800, 600, {
          fit: "cover",
          position: "center"
        })
        .webp({ quality: 85 })
        .toFile(filePath)

      imagePath = `/uploads/products/${fileName}`
    }

    const product = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        categoryId,
        available,
        image: imagePath
      },
      include: { category: true }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Eroare la crearea produsului: " + error.message }, { status: 500 })
  }
}
