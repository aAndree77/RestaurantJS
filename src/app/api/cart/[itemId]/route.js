import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH - Actualizează cantitatea unui produs din coș
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    const { itemId } = await params
    const { quantity } = await request.json()

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Cantitatea trebuie să fie cel puțin 1" },
        { status: 400 }
      )
    }

    // Verificăm că itemul aparține utilizatorului
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true
      }
    })

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Produsul nu a fost găsit în coș" },
        { status: 404 }
      )
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    })

    // Returnăm coșul actualizat
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
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
    console.error("Error updating cart item:", error)
    return NextResponse.json(
      { error: "Eroare la actualizarea produsului" },
      { status: 500 }
    )
  }
}

// DELETE - Șterge un produs din coș
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    const { itemId } = await params

    // Verificăm că itemul aparține utilizatorului
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true
      }
    })

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Produsul nu a fost găsit în coș" },
        { status: 404 }
      )
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    })

    // Returnăm coșul actualizat
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
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
    console.error("Error removing cart item:", error)
    return NextResponse.json(
      { error: "Eroare la ștergerea produsului" },
      { status: 500 }
    )
  }
}
