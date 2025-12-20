import { NextResponse } from "next/server"

export async function GET() {
  // Accept both variable names for flexibility
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID
  
  return NextResponse.json({
    clientId: clientId || null
  })
}
