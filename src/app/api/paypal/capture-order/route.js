import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_API = process.env.PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com"

async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  })

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token")
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const body = await request.json()
    const { paypalOrderId, deliveryAddress, phone, notes } = body

    // Capturează plata PayPal
    const accessToken = await getPayPalAccessToken()

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    })

    const captureData = await response.json()

    if (!response.ok || captureData.status !== "COMPLETED") {
      console.error("PayPal capture error:", captureData)
      return NextResponse.json({ error: "Plata nu a putut fi procesată" }, { status: 400 })
    }

    // Obține utilizatorul și coșul
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cart: {
          include: {
            items: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    })

    if (!user?.cart?.items?.length) {
      return NextResponse.json({ error: "Coșul este gol" }, { status: 400 })
    }

    // Calculează totalul
    const subtotal = user.cart.items.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity)
    }, 0)
    
    const freeDeliveryThreshold = 100
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 15
    const total = subtotal + deliveryFee

    // Generează număr de comandă
    const orderCount = await prisma.order.count()
    const orderNumber = `LBI-${String(orderCount + 1).padStart(5, '0')}`

    // Creează comanda în baza de date
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        subtotal,
        total,
        deliveryFee,
        deliveryAddress,
        phone,
        notes: notes || null,
        paymentMethod: "paypal",
        paymentStatus: "paid",
        paypalOrderId: paypalOrderId,
        paypalTransactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        status: "PENDING",
        items: {
          create: user.cart.items.map(item => ({
            menuItemId: item.menuItem.id,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    })

    // Golește coșul
    await prisma.cartItem.deleteMany({
      where: { cartId: user.cart.id }
    })

    return NextResponse.json(order)

  } catch (error) {
    console.error("Error capturing PayPal order:", error)
    return NextResponse.json(
      { error: "Eroare la procesarea plății" },
      { status: 500 }
    )
  }
}
