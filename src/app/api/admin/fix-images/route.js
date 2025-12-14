import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const SUPER_ADMIN_EMAIL = "andreiinsuratalu87@gmail.com"

// POST - Actualizează imaginile utilizatorilor Google
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    // Găsește toți utilizatorii cu conturi Google care nu au imagine
    const usersWithGoogleAccounts = await prisma.user.findMany({
      where: {
        image: null,
        accounts: {
          some: {
            provider: "google"
          }
        }
      },
      include: {
        accounts: {
          where: { provider: "google" }
        }
      }
    })

    let updated = 0
    for (const user of usersWithGoogleAccounts) {
      // Construiește URL-ul standard al pozei Google folosind email-ul
      // Google permite accesul la poze de profil prin Gravatar-like URL
      // Dar cel mai bun mod e să forțăm re-login
      
      // Alternativ, setăm un placeholder care să fie actualizat la următorul login
      if (user.accounts.length > 0) {
        // Nu putem obține imaginea fără re-autentificare
        // Dar putem marca utilizatorul pentru actualizare
        console.log(`User ${user.email} needs to re-login for profile picture`)
      }
    }

    return NextResponse.json({ 
      message: "Utilizatorii cu conturi Google trebuie să se reconecteze pentru a actualiza poza de profil",
      usersNeedingRelogin: usersWithGoogleAccounts.map(u => u.email)
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
