"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Navbar from "../../components/Navbar"

const statusConfig = {
  PENDING: {
    label: "În așteptare",
    description: "Comanda ta este în așteptare de confirmare",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    step: 1,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  CONFIRMED: {
    label: "Confirmată",
    description: "Comanda ta a fost confirmată și urmează să fie preparată",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    step: 2,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  PREPARING: {
    label: "Se prepară",
    description: "Bucătarii noștri lucrează la comanda ta",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    step: 3,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    )
  },
  READY: {
    label: "Gata de livrare",
    description: "Comanda ta este gata și așteaptă curierul",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    step: 4,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    )
  },
  DELIVERING: {
    label: "În curs de livrare",
    description: "Curierul este pe drum spre tine",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    step: 5,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  DELIVERED: {
    label: "Livrată",
    description: "Comanda a fost livrată cu succes. Poftă bună!",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    step: 6,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  CANCELLED: {
    label: "Anulată",
    description: "Comanda a fost anulată",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    step: 0,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  }
}

const orderSteps = [
  { status: "PENDING", label: "Primită" },
  { status: "CONFIRMED", label: "Confirmată" },
  { status: "PREPARING", label: "Se prepară" },
  { status: "READY", label: "Gata" },
  { status: "DELIVERING", label: "În livrare" },
  { status: "DELIVERED", label: "Livrată" }
]

export default function OrderPage({ params }) {
  const { orderId } = use(params)
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login")
      return
    }

    if (authStatus === "authenticated" && orderId) {
      fetchOrder()
      // Poll pentru actualizări
      const interval = setInterval(fetchOrder, 30000) // Verifică la fiecare 30 secunde
      return () => clearInterval(interval)
    }
  }, [authStatus, orderId])

  useEffect(() => {
    // Ascunde confetti după 5 secunde
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error("Comanda nu a fost găsită")
      }
      const data = await response.json()
      setOrder(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'long',
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

  if (error) {
    return (
      <>
        <Navbar solid />
        <main className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 pt-24 pb-12">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
              <p className="text-gray-500 mb-6">Verifică URL-ul sau încearcă din nou</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
              >
                Înapoi la pagina principală
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  const currentStatus = statusConfig[order.status]
  const currentStep = currentStatus.step

  return (
    <>
      <Navbar solid />
      
      {/* Confetti Animation */}
      {showConfetti && order.status !== "CANCELLED" && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#f97316'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-b from-stone-100 to-stone-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className={`w-20 h-20 ${currentStatus.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow`}>
              <div className={currentStatus.color}>
                {currentStatus.icon}
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
              {order.status === "PENDING" ? "Comandă plasată cu succes!" : currentStatus.label}
            </h1>
            <p className="text-gray-500">{currentStatus.description}</p>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-500 mb-1">Număr comandă</p>
                <p className="text-xl font-bold text-gray-900 font-mono">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Data comenzii</p>
                <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Progress Steps */}
            {order.status !== "CANCELLED" && (
              <div className="mb-8">
                <div className="flex justify-between items-center relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${(currentStep - 1) / (orderSteps.length - 1) * 100}%` }}
                    />
                  </div>
                  
                  {orderSteps.map((step, index) => {
                    const isCompleted = currentStep > index + 1
                    const isCurrent = currentStep === index + 1
                    return (
                      <div key={step.status} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted 
                            ? 'bg-amber-500 text-white' 
                            : isCurrent 
                              ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse' 
                              : 'bg-gray-200 text-gray-400'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                          isCompleted || isCurrent ? 'text-amber-600' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Estimated Time */}
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (order.estimatedTime || order.queuePosition) && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 mb-8 border border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {order.queuePosition && order.status === "PENDING" && (
                      <div className="mb-1">
                        <p className="text-sm text-amber-700 font-medium">Comenzi în față</p>
                        <p className="text-2xl font-bold text-amber-600">{order.queuePosition} {order.queuePosition === 1 ? 'comandă' : 'comenzi'}</p>
                      </div>
                    )}
                    {order.estimatedTime && (
                      <div>
                        <p className="text-sm text-amber-700 font-medium">Timp estimat de livrare</p>
                        <p className="text-2xl font-bold text-amber-600">{order.estimatedTime}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Produse comandate</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-500">Cantitate: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Preț unitar: {item.price.toFixed(0)} Lei</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{(item.price * item.quantity).toFixed(0)} Lei</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Adresa de livrare</h4>
                </div>
                <p className="text-gray-600 text-sm pl-13">{order.deliveryAddress}</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Metodă de plată</h4>
                </div>
                <p className="text-gray-600 text-sm pl-13">
                  {order.paymentMethod === "card" ? "Card bancar" : "Numerar la livrare"}
                </p>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="p-5 bg-amber-50 rounded-xl mb-8 border border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <h4 className="font-semibold text-amber-800">Observații</h4>
                </div>
                <p className="text-amber-700 text-sm">{order.notes}</p>
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-gray-100 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{order.subtotal.toFixed(0)} Lei</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livrare</span>
                  <span className={`font-medium ${order.deliveryFee === 0 ? 'text-emerald-500' : ''}`}>
                    {order.deliveryFee === 0 ? 'Gratuită' : `${order.deliveryFee.toFixed(0)} Lei`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-amber-600">{order.total.toFixed(0)} Lei</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Toate comenzile
            </Link>
            <Link
              href="/#menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Comandă din nou
            </Link>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 4s ease-out forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  )
}
