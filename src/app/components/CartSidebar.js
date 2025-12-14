"use client"

import { useCart } from "@/context/CartContext"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function CartSidebar() {
  const { data: session } = useSession()
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart, clearCart, loading } = useCart()
  const sidebarRef = useRef(null)
  const router = useRouter()

  // Close on escape key & prevent body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeCart()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeCart])

  // Focus trap
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }, [isOpen])

  const freeDeliveryThreshold = 100
  const progressToFreeDelivery = cart?.total ? Math.min((cart.total / freeDeliveryThreshold) * 100, 100) : 0
  const remainingForFreeDelivery = Math.max(freeDeliveryThreshold - (cart?.total || 0), 0)

  return (
    <>
      {/* Overlay with blur effect */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>
      
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Coș de cumpărături"
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <header className="flex-shrink-0 px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                {cart?.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Coșul tău</h2>
                <p className="text-sm text-gray-500">
                  {cart?.itemCount || 0} {cart?.itemCount === 1 ? 'produs' : 'produse'}
                </p>
              </div>
            </div>
            <button 
              onClick={closeCart}
              className="p-2.5 hover:bg-white/80 rounded-xl transition-all duration-200 group"
              aria-label="Închide coșul"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:rotate-90 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Free delivery progress */}
          {session?.user && cart?.items?.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">
                  {remainingForFreeDelivery > 0 
                    ? `Mai adaugă ${remainingForFreeDelivery.toFixed(0)} Lei pentru livrare gratuită`
                    : '🎉 Livrare gratuită deblocată!'
                  }
                </span>
                <span className="font-medium text-amber-600">{cart.total?.toFixed(0)}/{freeDeliveryThreshold} Lei</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressToFreeDelivery}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!session?.user ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Autentifică-te</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Pentru a adăuga produse în coș și a beneficia de oferte exclusive, te rugăm să te autentifici.
              </p>
              <Link 
                href="/login" 
                onClick={closeCart}
                className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                Autentificare
              </Link>
              <Link
                href="/register"
                onClick={closeCart}
                className="mt-3 text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Nu ai cont? Înregistrează-te
              </Link>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500 animate-pulse">Se încarcă coșul...</p>
            </div>
          ) : !cart?.items?.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop" 
                    alt="Restaurant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coșul tău este gol</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Descoperă preparatele noastre delicioase și adaugă-le în coș pentru o experiență culinară de neuitat.
              </p>
              <button 
                onClick={() => {
                  closeCart()
                  router.push('/menu')
                }}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explorează Meniul
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {cart.items.map((item) => (
                <article 
                  key={item.id} 
                  className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate pr-2">{item.menuItem.name}</h4>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${item.menuItem.category.color} text-white`}>
                            {item.menuItem.category.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                          aria-label={`Șterge ${item.menuItem.name} din coș`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeFromCart(item.id)
                              } else {
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            }}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-l-xl"
                            aria-label="Scade cantitatea"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900 tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-r-xl"
                            aria-label="Crește cantitatea"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-amber-600 tabular-nums">
                            {(item.menuItem.price * item.quantity).toFixed(0)} Lei
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">{item.menuItem.price} Lei / buc</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
              
              {/* Clear cart button */}
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full py-3 text-sm text-gray-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 group"
                >
                  <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Golește coșul
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {session?.user && cart?.items?.length > 0 && (
          <footer className="flex-shrink-0 border-t border-gray-100 bg-gradient-to-t from-gray-50 to-white p-6">
            {/* Order summary */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700 tabular-nums">{cart.total?.toFixed(0)} Lei</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Livrare</span>
                <span className={`font-medium tabular-nums ${cart.total >= freeDeliveryThreshold ? 'text-emerald-500' : 'text-gray-700'}`}>
                  {cart.total >= freeDeliveryThreshold ? 'Gratuită' : '15 Lei'}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900 tabular-nums">
                  {(cart.total + (cart.total >= freeDeliveryThreshold ? 0 : 15)).toFixed(0)} Lei
                </span>
              </div>
            </div>
            
            {/* Checkout button */}
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="relative w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] text-white font-bold rounded-2xl transition-all duration-500 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:bg-right active:scale-[0.98] overflow-hidden group flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Finalizează Comanda
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Plată securizată
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                100% Garantat
              </span>
            </div>
          </footer>
        )}
      </aside>
    </>
  )
}
