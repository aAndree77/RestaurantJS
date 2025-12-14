import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Obține toate categoriile
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Eroare la încărcarea categoriilor" },
      { status: 500 }
    )
  }
}
