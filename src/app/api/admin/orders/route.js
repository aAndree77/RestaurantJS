export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

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

// GET - Toate comenzile
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            accounts: {
              where: { provider: "google" },
              select: { provider: true }
            }
          }
        }
      }
    })

    // Adaugă flag pentru cont Google și generează avatar pentru utilizatorii fără imagine
    const ordersWithGoogleFlag = orders.map(order => {
      if (order.user) {
        const isGoogleAccount = order.user.accounts?.length > 0
        order.user.isGoogleAccount = isGoogleAccount
        
        // Pentru utilizatorii Google fără imagine, generăm un avatar
        if (isGoogleAccount && !order.user.image && order.user.name) {
          order.user.image = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.user.name)}&background=4285f4&color=fff&size=96&bold=true`
        }
        
        delete order.user.accounts
      }
      return order
    })

    return NextResponse.json(ordersWithGoogleFlag)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
