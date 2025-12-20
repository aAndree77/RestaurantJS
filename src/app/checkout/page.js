"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import Link from "next/link"
import Navbar from "../components/Navbar"

function CheckoutContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cart, loading: cartLoading, refetch } = useCart()
  const paypalButtonRef = useRef(null)
  const paypalRendered = useRef(false)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [paypalReady, setPaypalReady] = useState(false)
  const [paypalError, setPaypalError] = useState(false)
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
      }))
    }
  }, [session])

  // Load PayPal SDK dynamically
  useEffect(() => {
    const loadPayPalScript = async () => {
      // Fetch client ID from API to avoid build-time issues
      try {
        const res = await fetch('/api/paypal/config')
        const data = await res.json()
        
        if (!data.clientId) {
          console.error("PayPal Client ID not available")
          setPaypalError(true)
          return
        }

        // Check if already loaded
        if (window.paypal) {
          setPaypalReady(true)
          return
        }

        const script = document.createElement('script')
        script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=EUR`
        script.async = true
        script.onload = () => {
          console.log("PayPal SDK loaded")
          setPaypalReady(true)
        }
        script.onerror = () => {
          console.error("Failed to load PayPal SDK")
          setPaypalError(true)
        }
        document.body.appendChild(script)
      } catch (err) {
        console.error("Error loading PayPal config:", err)
        setPaypalError(true)
      }
    }

    loadPayPalScript()
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout")
    }
  }, [status, router])

  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0) && step === 1) {
      router.push("/#menu")
    }
  }, [cart, cartLoading, router, step])

  // Verifică dacă utilizatorul revine de la PayPal
  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setErrors({ submit: "Plata a fost anulată. Încearcă din nou." })
      setStep(2)
    }
  }, [searchParams])

  const freeDeliveryThreshold = 100
  const deliveryFee = cart?.total >= freeDeliveryThreshold ? 0 : 15
  const total = (cart?.total || 0) + deliveryFee

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Numele este obligatoriu"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefonul este obligatoriu"
    } else if (!/^(\+40|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Număr de telefon invalid"
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Adresa este obligatorie"
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Adresa trebuie să fie completă"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setOrderData({
      deliveryAddress: formData.address,
      phone: formData.phone,
      notes: formData.notes
    })
    setStep(2)
  }

  // Render PayPal buttons când sunt gata
  useEffect(() => {
    if (step === 2 && paypalReady && !paypalRendered.current && paypalButtonRef.current && orderData) {
      paypalRendered.current = true
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 50
        },
        createOrder: async () => {
          try {
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orderData)
            })
            
            const data = await response.json()
            
            if (!response.ok) {
              throw new Error(data.error)
            }
            
            return data.orderId
          } catch (error) {
            setErrors({ submit: error.message || "Eroare la crearea plății" })
            throw error
          }
        },
        onApprove: async (data) => {
          setStep(3)
          setIsSubmitting(true)
          
          try {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paypalOrderId: data.orderID,
                ...orderData
              })
            })
            
            const result = await response.json()
            
            if (response.ok) {
              await refetch()
              router.push(`/order/${result.id}`)
            } else {
              setErrors({ submit: result.error })
              setStep(2)
            }
          } catch (error) {
            setErrors({ submit: "Eroare la procesarea plății" })
            setStep(2)
          } finally {
            setIsSubmitting(false)
          }
        },
        onCancel: () => {
          setErrors({ submit: "Plata a fost anulată" })
        },
        onError: (err) => {
          console.error("Payment error:", err)
          setErrors({ submit: "Eroare la procesarea plății. Te rugăm să încerci din nou." })
        }
      }).render(paypalButtonRef.current)
    }
  }, [step, paypalReady, orderData, router, refetch])

  // Reset rendered flag when going back
  useEffect(() => {
    if (step === 1) {
      paypalRendered.current = false
    }
  }, [step])

  if (status === "loading" || cartLoading) {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/#menu" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Înapoi la meniu
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Finalizare Comandă</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-4">
              {[
                { num: 1, label: "Detalii livrare" },
                { num: 2, label: "Plată online" },
                { num: 3, label: "Confirmare" }
              ].map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    step >= s.num 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : s.num}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>
                    {s.label}
                  </span>
                  {i < 2 && (
                    <div className={`w-12 sm:w-24 h-1 mx-4 rounded-full ${step > s.num ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {step === 1 && (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    Detalii Livrare
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nume complet *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-amber-500'} focus:ring-2 focus:border-transparent transition-all`}
                        placeholder="Ion Popescu"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-amber-500'} focus:ring-2 focus:border-transparent transition-all`}
                        placeholder="0712 345 678"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresa de livrare *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-amber-500'} focus:ring-2 focus:border-transparent transition-all resize-none`}
                        placeholder="Strada, număr, bloc, scară, etaj, apartament, oraș"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observații (opțional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                        placeholder="Ex: Interfon stricat, sunați la telefon"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
                  >
                    Continuă la Plată
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </form>
              )}

              {step === 2 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    Plată online
                  </h2>

                  {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.submit}
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <p className="font-medium text-blue-800">Plată securizată</p>
                        <p className="text-sm text-blue-600">Datele tale sunt protejate și criptate</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total de plată:</span>
                        <span className="text-2xl font-bold text-gray-900">{total.toFixed(0)} Lei</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-6">≈ {(total * 0.20).toFixed(2)} EUR</p>
                      
                      {/* Payment Button Container */}
                      <div ref={paypalButtonRef} className="min-h-[50px]">
                        {!paypalReady && !paypalError && (
                          <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2 text-gray-500">Se încarcă opțiunile de plată...</span>
                          </div>
                        )}
                        {paypalError && (
                          <div className="text-center py-4">
                            <p className="text-red-600 mb-3">Nu s-a putut încărca sistemul de plăți.</p>
                            <button 
                              onClick={() => window.location.reload()}
                              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                            >
                              Reîncearcă
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setStep(1); setErrors({}); }}
                    className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Înapoi la detalii
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Se procesează plata...</h2>
                  <p className="text-gray-500">Te rugăm să aștepți câteva secunde</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Rezumat Comandă
                </h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.menuItem.name}</p>
                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {(item.menuItem.price * item.quantity).toFixed(0)} Lei
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{cart?.total?.toFixed(0)} Lei</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Livrare</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-emerald-500' : ''}`}>
                      {deliveryFee === 0 ? 'Gratuită' : `${deliveryFee} Lei`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-amber-600">{total.toFixed(0)} Lei</span>
                  </div>
                </div>

                {step === 1 && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-amber-800 text-sm">Timp estimat de livrare</p>
                        <p className="text-amber-600 text-sm">30-45 minute</p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                      </svg>
                      <div>
                        <p className="font-medium text-blue-800 text-sm">Plată securizată</p>
                        <p className="text-blue-600 text-sm">PayPal</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
