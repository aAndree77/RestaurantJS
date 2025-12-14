import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Obține toate produsele din meniu grupate pe categorii
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        menuItems: {
          where: {
            available: true
          },
          orderBy: { name: 'asc' }
        }
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { error: "Eroare la încărcarea meniului" },
      { status: 500 }
    )
  }
}
