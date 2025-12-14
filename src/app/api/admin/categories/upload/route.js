export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"
import { writeFile, unlink, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

// Imaginile predefinite din bibliotecă
const PREDEFINED_IMAGES = [
  { url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop", name: "Pizza" },
  { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop", name: "Burger" },
  { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop", name: "Salată" },
  { url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop", name: "Paste" },
  { url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200&h=200&fit=crop", name: "Carne/Grill" },
  { url: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=200&h=200&fit=crop", name: "Pește" },
  { url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200&fit=crop", name: "Desert" },
  { url: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop", name: "Prăjituri" },
  { url: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=200&h=200&fit=crop", name: "Băuturi" },
  { url: "https://images.unsplash.com/photo-1547825407-2f64f6e2c7c4?w=200&h=200&fit=crop", name: "Cocktailuri" },
  { url: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=200&h=200&fit=crop", name: "Supă" },
  { url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=200&h=200&fit=crop", name: "Tacos/Mexican" },
  { url: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=200&h=200&fit=crop", name: "Sushi/Asian" },
  { url: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop", name: "Sandwich" },
  { url: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&h=200&fit=crop", name: "Cartofi Prăjiți" },
  { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop", name: "Cafea" },
  { url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=200&fit=crop", name: "Bere" },
  { url: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=200&h=200&fit=crop", name: "Vin" },
  { url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop", name: "Mic Dejun" },
  { url: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&h=200&fit=crop", name: "Aperitive" },
  { url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop", name: "BBQ" },
  { url: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=200&h=200&fit=crop", name: "Fructe de Mare" },
  { url: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop", name: "Mâncare Tradițională" },
  { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop", name: "Fine Dining" }
]

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

// Funcție pentru a adăuga imaginile predefinite dacă nu există
async function seedPredefinedImages() {
  for (const img of PREDEFINED_IMAGES) {
    const exists = await prisma.categoryImage.findFirst({
      where: { url: img.url }
    })
    if (!exists) {
      await prisma.categoryImage.create({
        data: { url: img.url, name: img.name }
      })
    }
  }
}

// GET - Obține toate imaginile (și seedează imaginile predefinite dacă nu există)
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    // Seedează imaginile predefinite la prima accesare
    await seedPredefinedImages()

    const images = await prisma.categoryImage.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Upload imagine nouă
export async function POST(request) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "Niciun fișier selectat" }, { status: 400 })
    }

    // Verifică tipul fișierului
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Tip de fișier nepermis. Acceptăm: JPG, PNG, WebP, AVIF, GIF" 
      }, { status: 400 })
    }

    // Limitează mărimea (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Fișierul este prea mare. Maxim 5MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Creează directorul dacă nu există
    const uploadDir = path.join(process.cwd(), "public", "uploads", "categories")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generează nume unic
    const ext = file.name.split(".").pop()
    const uniqueName = `cat_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = path.join(uploadDir, uniqueName)
    
    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/categories/${uniqueName}`

    // Salvează în baza de date
    const categoryImage = await prisma.categoryImage.create({
      data: {
        url: imageUrl,
        name: file.name
      }
    })

    return NextResponse.json(categoryImage)
  } catch (error) {
    console.error("Error uploading image:", error)
    return NextResponse.json({ error: "Eroare la upload: " + error.message }, { status: 500 })
  }
}

// DELETE - Șterge imagine (din DB și fișier local dacă există)
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

    // Găsește imaginea
    const image = await prisma.categoryImage.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json({ error: "Imagine negăsită" }, { status: 404 })
    }

    // Verifică dacă imaginea este folosită de vreo categorie
    const usedByCategory = await prisma.category.findFirst({
      where: { image: image.url }
    })

    if (usedByCategory) {
      return NextResponse.json({ 
        error: `Imaginea este folosită de categoria "${usedByCategory.name}". Schimbă imaginea categoriei înainte de a o șterge.` 
      }, { status: 400 })
    }

    // Șterge fișierul fizic doar dacă este un fișier local (nu URL extern)
    if (image.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", image.url)
      try {
        if (existsSync(filePath)) {
          await unlink(filePath)
        }
      } catch (e) {
        console.error("Error deleting file:", e)
      }
    }

    // Șterge din baza de date
    await prisma.categoryImage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Eroare la ștergere" }, { status: 500 })
  }
}
