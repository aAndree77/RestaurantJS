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

// GET - Obține un testimonial specific
export async function GET(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial negăsit" }, { status: 404 })
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error("Error fetching testimonial:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PUT - Actualizează testimonial
export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params
    const formData = await request.formData()
    
    const name = formData.get("name")
    const role = formData.get("role")
    const content = formData.get("content")
    const rating = parseInt(formData.get("rating")) || 5
    const active = formData.get("active") === "true"
    const order = parseInt(formData.get("order")) || 0
    const imageFile = formData.get("image")

    if (!name || !role || !content) {
      return NextResponse.json({ error: "Numele, rolul și conținutul sunt obligatorii" }, { status: 400 })
    }

    // Verifică dacă testimonialul există
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!existingTestimonial) {
      return NextResponse.json({ error: "Testimonial negăsit" }, { status: 404 })
    }

    let imagePath = existingTestimonial.image

    // Procesează imaginea nouă dacă există
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Creează directorul dacă nu există
      const uploadDir = path.join(process.cwd(), "public", "uploads", "testimonials")
      await mkdir(uploadDir, { recursive: true })

      // Șterge imaginea veche dacă există
      if (existingTestimonial.image) {
        try {
          const oldPath = path.join(process.cwd(), "public", existingTestimonial.image)
          await unlink(oldPath)
        } catch (e) {
          // Ignoră eroarea dacă fișierul nu există
        }
      }

      // Generează nume unic
      const timestamp = Date.now()
      const fileName = `${timestamp}-${name.toLowerCase().replace(/\s+/g, "-")}.webp`
      const filePath = path.join(uploadDir, fileName)

      // Procesează și optimizează imaginea cu sharp
      await sharp(buffer)
        .resize(200, 200, {
          fit: "cover",
          position: "center"
        })
        .webp({ quality: 85 })
        .toFile(filePath)

      imagePath = `/uploads/testimonials/${fileName}`
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        role,
        content,
        rating,
        active,
        order,
        image: imagePath
      }
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json({ error: "Eroare la actualizarea testimonialului" }, { status: 500 })
  }
}

// DELETE - Șterge testimonial
export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    // Obține testimonialul pentru a șterge imaginea
    const testimonial = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial negăsit" }, { status: 404 })
    }

    // Șterge imaginea dacă există
    if (testimonial.image) {
      try {
        const imagePath = path.join(process.cwd(), "public", testimonial.image)
        await unlink(imagePath)
      } catch (e) {
        // Ignoră eroarea dacă fișierul nu există
      }
    }

    await prisma.testimonial.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json({ error: "Eroare la ștergerea testimonialului" }, { status: 500 })
  }
}
