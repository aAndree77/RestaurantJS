"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { useSession } from "next-auth/react"

export default function MenuSection() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addingToCart, setAddingToCart] = useState({})
  const { addToCart, openCart } = useCart()
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch('/api/menu')
        if (!response.ok) {
          throw new Error('Eroare la încărcarea meniului')
        }
        const data = await response.json()
        
        // Extragem doar 6 produse populare din diferite categorii
        let popularItems = []
        if (data.categories) {
          // Luăm câte 1-2 produse din fiecare categorie pentru diversitate
          const allItems = data.categories.flatMap(cat => 
            cat.menuItems.map(item => ({ ...item, category: cat }))
          )
          // Selectăm 6 produse variate (din categorii diferite)
          const categories = [...new Set(allItems.map(item => item.category?.name))]
          categories.forEach(catName => {
            const catItems = allItems.filter(item => item.category?.name === catName)
            if (catItems.length > 0 && popularItems.length < 6) {
              popularItems.push(catItems[0])
            }
          })
          // Dacă avem mai puțin de 6, adăugăm mai multe
          if (popularItems.length < 6) {
            const remaining = allItems.filter(item => !popularItems.includes(item))
            popularItems = [...popularItems, ...remaining.slice(0, 6 - popularItems.length)]
          }
        } else if (Array.isArray(data)) {
          popularItems = data.slice(0, 6)
        }
        
        setMenuItems(popularItems)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

  const [addedItems, setAddedItems] = useState({})

  const handleAddToCart = async (item) => {
    if (!session?.user) {
      openCart()
      return
    }

    setAddingToCart(prev => ({ ...prev, [item.id]: true }))
    
    const result = await addToCart(item.id)
    
    setAddingToCart(prev => ({ ...prev, [item.id]: false }))
    
    if (result.success) {
      // Show success feedback without opening cart
      setAddedItems(prev => ({ ...prev, [item.id]: true }))
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [item.id]: false }))
      }, 1000)
    }
  }

  const getCategoryColor = (category) => {
    return category?.color || "bg-gray-500"
  }

  if (loading) {
    return (
      <section id="menu" className="py-24 bg-gradient-to-b from-stone-50 to-amber-50/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              Descoperă Gusturile
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
              Meniul Nostru
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full mb-6"></div>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="menu" className="py-24 bg-gradient-to-b from-stone-50 to-amber-50/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="menu" className="py-24 bg-gradient-to-b from-stone-50 to-amber-50/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Cele Mai Populare
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Preparate Preferate
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descoperă preparatele noastre cele mai îndrăgite, create cu ingrediente premium 
            și tehnici culinare perfecționate de generații.
          </p>
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <div 
              key={item.id} 
              className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image area */}
              <div className="relative h-52 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Category badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 ${getCategoryColor(item.category)} text-white text-xs font-semibold rounded-full shadow-lg`}>
                  {item.category?.name}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-amber-600">{item.price}</span>
                    <span className="text-sm text-gray-500 ml-1">Lei</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.description}</p>
                
                {/* Add to order button */}
                <button 
                  onClick={() => handleAddToCart(item)}
                  disabled={addingToCart[item.id]}
                  className={`w-full py-3 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:cursor-not-allowed ${
                    addedItems[item.id] 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-amber-500 hover:text-white'
                  }`}
                >
                  {addingToCart[item.id] ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  ) : addedItems[item.id] ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Adăugat!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adaugă la comandă
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View full menu CTA */}
        <div className="text-center mt-16">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
          >
            Vezi Meniul Complet
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
