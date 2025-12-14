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

// GET - Lista tuturor testimonialelor (admin)
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Creează testimonial nou cu imagine
export async function POST(request) {
  try {
    const admin = await checkAdmin()
    if (!canModify(admin)) {
      return NextResponse.json({ error: "Acces interzis - doar adminii pot modifica testimoniale" }, { status: 403 })
    }

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

    let imagePath = null

    // Procesează imaginea dacă există
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Creează directorul dacă nu există
      const uploadDir = path.join(process.cwd(), "public", "uploads", "testimonials")
      await mkdir(uploadDir, { recursive: true })

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

    const testimonial = await prisma.testimonial.create({
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
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Eroare la crearea testimonialului" }, { status: 500 })
  }
}
