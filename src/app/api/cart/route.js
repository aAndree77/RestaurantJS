import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// GET - Obține coșul utilizatorului curent
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    let cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    // Dacă nu există coș, creăm unul gol
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id
        },
        include: {
          items: {
            include: {
              menuItem: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      })
    }

    // Calculăm totalul
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity)
    }, 0)

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      ...cart,
      total,
      itemCount
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { error: "Eroare la încărcarea coșului" },
      { status: 500 }
    )
  }
}

// POST - Adaugă un produs în coș
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    const { menuItemId, quantity = 1 } = await request.json()

    if (!menuItemId) {
      return NextResponse.json(
        { error: "ID-ul produsului este obligatoriu" },
        { status: 400 }
      )
    }

    // Verificăm dacă produsul există
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    })

    if (!menuItem) {
      return NextResponse.json(
        { error: "Produsul nu a fost găsit" },
        { status: 404 }
      )
    }

    // Găsim sau creăm coșul
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id }
      })
    }

    // Verificăm dacă produsul este deja în coș
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_menuItemId: {
          cartId: cart.id,
          menuItemId
        }
      }
    })

    if (existingItem) {
      // Actualizăm cantitatea
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      // Adăugăm produs nou
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          menuItemId,
          quantity
        }
      })
    }

    // Returnăm coșul actualizat
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    const total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity)
    }, 0)

    const itemCount = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      ...updatedCart,
      total,
      itemCount
    })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json(
      { error: "Eroare la adăugarea în coș" },
      { status: 500 }
    )
  }
}

// DELETE - Golește coșul
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id }
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return NextResponse.json({ message: "Coșul a fost golit" })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json(
      { error: "Eroare la golirea coșului" },
      { status: 500 }
    )
  }
}
