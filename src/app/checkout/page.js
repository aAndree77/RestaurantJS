"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import Link from "next/link"
import Navbar from "../components/Navbar"

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { cart, loading: cartLoading, clearCart, refetch } = useCart()
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "card"
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: detalii, 2: plată, 3: procesare

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
      }))
    }
  }, [session])

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

    setStep(2)
  }

  const handlePayment = async () => {
    setStep(3)
    setIsSubmitting(true)

    // Simulăm procesarea plății
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          deliveryAddress: formData.address,
          phone: formData.phone,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Golește coșul local
        await refetch()
        // Redirect la pagina de confirmare
        router.push(`/order/${data.id}`)
      } else {
        setErrors({ submit: data.error })
        setStep(2)
      }
    } catch (error) {
      console.error("Error placing order:", error)
      setErrors({ submit: "Eroare la plasarea comenzii. Încearcă din nou." })
      setStep(2)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                { num: 2, label: "Plată" },
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
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    Metodă de Plată
                  </h2>

                  {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {errors.submit}
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    {[
                      { id: "card", label: "Card bancar", icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      ), desc: "Plătește securizat cu cardul" },
                      { id: "cash", label: "Numerar la livrare", icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ), desc: "Plătește când primești comanda" }
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.paymentMethod === method.id 
                            ? 'border-amber-500 bg-amber-50' 
                            : 'border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          formData.paymentMethod === method.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{method.label}</p>
                          <p className="text-sm text-gray-500">{method.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === method.id ? 'border-amber-500' : 'border-gray-300'
                        }`}>
                          {formData.paymentMethod === method.id && (
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-xl space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Număr Card</label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Data Expirare</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Înapoi
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Plătește {total.toFixed(0)} Lei
                    </button>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
