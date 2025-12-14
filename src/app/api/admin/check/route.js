import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// Email-ul tău de Google - SUPER ADMIN
const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false })
    }

    const email = session.user.email

    // Verifică dacă e super admin
    if (email === SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ 
        isAdmin: true, 
        role: "super_admin",
        email,
        name: session.user.name
      })
    }

    // Verifică în baza de date
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (admin) {
      return NextResponse.json({ 
        isAdmin: true, 
        role: admin.role,
        email: admin.email,
        name: admin.name
      })
    }

    return NextResponse.json({ isAdmin: false })
  } catch (error) {
    console.error("Error checking admin:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
