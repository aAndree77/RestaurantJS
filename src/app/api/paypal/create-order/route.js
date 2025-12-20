import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
// Folosește sandbox pentru test, live pentru producție
// Setează PAYPAL_MODE=live în Vercel când ești gata pentru producție
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
    const errorData = await response.text()
    console.error("PayPal token error:", errorData)
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
    const { deliveryAddress, phone, notes } = body

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

    // Convertește în EUR (aproximativ, ar trebui folosit un API de conversie)
    const RON_TO_EUR = 0.20 // 1 RON = 0.20 EUR aproximativ
    const totalEUR = (total * RON_TO_EUR).toFixed(2)

    // Creează comanda PayPal
    const accessToken = await getPayPalAccessToken()

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "EUR",
          value: totalEUR,
          breakdown: {
            item_total: {
              currency_code: "EUR",
              value: (subtotal * RON_TO_EUR).toFixed(2)
            },
            shipping: {
              currency_code: "EUR",
              value: (deliveryFee * RON_TO_EUR).toFixed(2)
            }
          }
        },
        items: user.cart.items.map(item => ({
          name: item.menuItem.name,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: "EUR",
            value: (item.menuItem.price * RON_TO_EUR).toFixed(2)
          }
        })),
        description: "Comandă La Bella Italia"
      }],
      application_context: {
        brand_name: "La Bella Italia",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXTAUTH_URL}/checkout?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout?canceled=true`
      }
    }

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    })

    const paypalOrder = await response.json()

    if (!response.ok) {
      console.error("PayPal error:", paypalOrder)
      return NextResponse.json({ error: "Eroare la crearea plății" }, { status: 500 })
    }

    // Salvează detaliile comenzii temporar în sesiune sau DB
    // Pentru simplitate, le vom trimite înapoi la client
    return NextResponse.json({
      orderId: paypalOrder.id,
      orderData: {
        deliveryAddress,
        phone,
        notes,
        totalRON: total,
        totalEUR
      }
    })

  } catch (error) {
    console.error("Error creating PayPal order:", error)
    return NextResponse.json(
      { error: "Eroare la crearea plății PayPal" },
      { status: 500 }
    )
  }
}
