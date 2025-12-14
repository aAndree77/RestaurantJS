import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

// Generează un număr de comandă unic
function generateOrderNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${year}${month}${day}-${random}`
}

// GET - Obține comenzile utilizatorului
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    const orders = await prisma.order.findMany({
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
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Eroare la încărcarea comenzilor" },
      { status: 500 }
    )
  }
}

// POST - Creează o comandă nouă
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Trebuie să fii autentificat" },
        { status: 401 }
      )
    }

    const { deliveryAddress, phone, notes, paymentMethod } = await request.json()

    if (!deliveryAddress || !phone) {
      return NextResponse.json(
        { error: "Adresa și telefonul sunt obligatorii" },
        { status: 400 }
      )
    }

    // Obține coșul utilizatorului
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Coșul este gol" },
        { status: 400 }
      )
    }

    // Calculează totalurile
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity)
    }, 0)

    const freeDeliveryThreshold = 100
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 15
    const total = subtotal + deliveryFee

    // Calculează timpul estimat (30-45 minute de acum)
    const now = new Date()
    const minTime = new Date(now.getTime() + 30 * 60000)
    const maxTime = new Date(now.getTime() + 45 * 60000)
    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    const estimatedTime = `${formatTime(minTime)} - ${formatTime(maxTime)}`

    // Creează comanda
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress,
        phone,
        notes: notes || null,
        paymentMethod: paymentMethod || 'card',
        paymentStatus: 'paid', // Simulăm plata reușită
        status: 'CONFIRMED',
        estimatedTime,
        items: {
          create: cart.items.map(item => ({
            menuItemId: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity
          }))
        }
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

    // Golește coșul
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error.message)
    console.error("Full error:", error)
    return NextResponse.json(
      { error: "Eroare la plasarea comenzii: " + error.message },
      { status: 500 }
    )
  }
}
