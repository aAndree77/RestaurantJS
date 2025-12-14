export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { writeFile, mkdir, unlink } from "fs/promises"
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

// GET - Obține un produs
export async function GET(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    const product = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!product) {
      return NextResponse.json({ error: "Produs negăsit" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PATCH - Actualizează produs
export async function PATCH(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params
    const formData = await request.formData()
    
    const name = formData.get("name")
    const description = formData.get("description")
    const price = formData.get("price") ? parseFloat(formData.get("price")) : undefined
    const categoryId = formData.get("categoryId")
    const available = formData.get("available") === "true"
    const imageFile = formData.get("image")

    const updateData = {}
    if (name) updateData.name = name
    if (description) updateData.description = description
    if (price) updateData.price = price
    if (categoryId) updateData.categoryId = categoryId
    updateData.available = available

    // Procesează noua imagine dacă există
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
      await mkdir(uploadDir, { recursive: true })

      const timestamp = Date.now()
      const fileName = `${timestamp}-${(name || "product").toLowerCase().replace(/\s+/g, "-")}.webp`
      const filePath = path.join(uploadDir, fileName)

      await sharp(buffer)
        .resize(800, 600, {
          fit: "cover",
          position: "center"
        })
        .webp({ quality: 85 })
        .toFile(filePath)

      updateData.image = `/uploads/products/${fileName}`

      // Încearcă să șterge imaginea veche
      try {
        const oldProduct = await prisma.menuItem.findUnique({ where: { id } })
        if (oldProduct?.image?.startsWith("/uploads/")) {
          const oldPath = path.join(process.cwd(), "public", oldProduct.image)
          await unlink(oldPath)
        }
      } catch (e) {
        // Ignoră eroarea dacă fișierul nu există
      }
    }

    const product = await prisma.menuItem.update({
      where: { id },
      data: updateData,
      include: { category: true }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Eroare la actualizarea produsului" }, { status: 500 })
  }
}

// DELETE - Șterge produs
export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    // Obține produsul pentru a șterge imaginea
    const product = await prisma.menuItem.findUnique({ where: { id } })
    
    if (product?.image?.startsWith("/uploads/")) {
      try {
        const imagePath = path.join(process.cwd(), "public", product.image)
        await unlink(imagePath)
      } catch (e) {
        // Ignoră eroarea
      }
    }

    await prisma.menuItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Eroare la ștergerea produsului" }, { status: 500 })
  }
}
