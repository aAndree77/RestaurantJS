import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Lista testimonialelor active (public)
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
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
