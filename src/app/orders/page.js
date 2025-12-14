"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Navbar from "../components/Navbar"

const statusConfig = {
  PENDING: { label: "În așteptare", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  CONFIRMED: { label: "Confirmată", color: "text-blue-600", bgColor: "bg-blue-100" },
  PREPARING: { label: "Se prepară", color: "text-orange-600", bgColor: "bg-orange-100" },
  READY: { label: "Gata", color: "text-emerald-600", bgColor: "bg-emerald-100" },
  DELIVERING: { label: "În livrare", color: "text-purple-600", bgColor: "bg-purple-100" },
  DELIVERED: { label: "Livrată", color: "text-green-600", bgColor: "bg-green-100" },
  CANCELLED: { label: "Anulată", color: "text-red-600", bgColor: "bg-red-100" }
}

export default function OrdersPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login?callbackUrl=/orders")
      return
    }

    if (authStatus === "authenticated") {
      fetchOrders()
    }
  }, [authStatus])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar solid />
      <main className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Comenzile Mele</h1>
              <p className="text-gray-500 mt-1">Istoric și stare comenzi</p>
            </div>
            <Link
              href="/#menu"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Comandă nouă
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Nu ai comenzi încă</h2>
              <p className="text-gray-500 mb-6">Explorează meniul nostru și plasează prima comandă</p>
              <Link
                href="/#menu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Vezi Meniul
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status]
                return (
                  <Link
                    key={order.id}
                    href={`/order/${order.id}`}
                    className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-amber-200 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Order Images */}
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={item.id}
                            className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm"
                            style={{ zIndex: 3 - index }}
                          >
                            <Image
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 font-mono">{order.orderNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {order.items.map(item => item.menuItem.name).join(", ")}
                        </p>
                      </div>

                      {/* Total & Arrow */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-lg font-bold text-amber-600">{order.total.toFixed(0)} Lei</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Estimated Time for Active Orders */}
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && order.estimatedTime && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-500">Livrare estimată:</span>
                        <span className="font-medium text-amber-600">{order.estimatedTime}</span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="sm:hidden mt-8">
            <Link
              href="/#menu"
              className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Comandă nouă
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
