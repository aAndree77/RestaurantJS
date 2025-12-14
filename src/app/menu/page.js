"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/context/CartContext"
import { useSession } from "next-auth/react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import Image from "next/image"
import Link from "next/link"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { addToCart, openCart } = useCart()
  const { data: session } = useSession()
  const [addedItems, setAddedItems] = useState({})
  const [addingToCart, setAddingToCart] = useState({})

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await fetch("/api/menu")
      const data = await res.json()
      
      if (data.categories) {
        setCategories(data.categories)
        const allItems = data.categories.flatMap(cat => 
          cat.menuItems.map(item => ({ ...item, categoryName: cat.name, categoryIcon: cat.icon, category: cat }))
        )
        setMenuItems(allItems)
      } else if (Array.isArray(data)) {
        setMenuItems(data)
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (item) => {
    if (!session?.user) {
      openCart()
      return
    }

    setAddingToCart(prev => ({ ...prev, [item.id]: true }))
    
    const result = await addToCart(item.id)
    
    setAddingToCart(prev => ({ ...prev, [item.id]: false }))
    
    if (result.success) {
      setAddedItems(prev => ({ ...prev, [item.id]: true }))
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [item.id]: false }))
      }, 1500)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch && item.available !== false
  })

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.categoryName || item.category?.name || "Alte produse"
    if (!acc[category]) {
      acc[category] = { 
        items: [], 
        icon: item.categoryIcon || item.category?.icon, 
        image: item.category?.image,
        id: item.categoryId 
      }
    }
    acc[category].items.push(item)
    return acc
  }, {})

  const getCategoryColor = (category) => {
    return category?.color || "bg-amber-500"
  }

  return (
    <>
      <Navbar solid />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-amber-50 via-orange-50/50 to-stone-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-20 right-0 w-64 h-64 bg-orange-200/40 rounded-full blur-3xl translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl"></div>
        
        {/* Floating food icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 left-[10%] w-16 h-16 opacity-10 animate-float">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <div className="absolute top-32 right-[15%] w-14 h-14 opacity-10 animate-float" style={{ animationDelay: "1s" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-orange-600">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="absolute bottom-20 left-[20%] w-12 h-12 opacity-10 animate-float" style={{ animationDelay: "2s" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="absolute bottom-32 right-[25%] w-10 h-10 opacity-10 animate-float" style={{ animationDelay: "0.5s" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-orange-500">
              <path d="M8 21h8M12 15v6M17 3l-5 5-5-5M12 8v7"/>
            </svg>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Descoperă Gusturile Italiei
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6">
              Meniul <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Complet</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Explorează toate preparatele noastre autentice italiene, pregătite cu ingrediente proaspete și rețete tradiționale
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar & Filter Toggle */}
          <div className="flex justify-center mb-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Caută în meniu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:bg-white transition-all shadow-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 md:gap-3 mt-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full font-medium transition-all text-sm md:text-base flex-shrink-0 ${
                activeCategory === "all"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Toate ({menuItems.filter(i => i.available !== false).length})
              </span>
            </button>
            {categories.map((category) => {
              const count = menuItems.filter(i => i.categoryId === category.id && i.available !== false).length
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full font-medium transition-all text-sm md:text-base flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span>{category.icon || "🍴"}</span>
                  )}
                  {category.name} ({count})
                </button>
              )
            })}
          </div>
          
          {/* Active filters summary */}
          {(searchQuery || activeCategory !== "all") && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Filtre active:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  Căutare: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-amber-900">×</button>
                </span>
              )}
              {activeCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  {categories.find(c => c.id === activeCategory)?.image ? (
                    <img 
                      src={categories.find(c => c.id === activeCategory)?.image} 
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    categories.find(c => c.id === activeCategory)?.icon
                  )} {categories.find(c => c.id === activeCategory)?.name}
                  <button onClick={() => setActiveCategory("all")} className="hover:text-amber-900">×</button>
                </span>
              )}
              <span className="text-sm text-gray-500 ml-2">
                ({filteredItems.length} rezultate)
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-16 bg-gradient-to-b from-stone-50 to-amber-50/30 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Niciun rezultat găsit</h3>
              <p className="text-gray-600 mb-6">Încearcă o altă căutare sau selectează altă categorie</p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
              >
                Resetează filtrele
              </button>
            </div>
          ) : activeCategory === "all" ? (
            // Grouped by category
            Object.entries(groupedItems).map(([categoryName, { items, icon, image }]) => (
              <div key={categoryName} className="mb-16 last:mb-0">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25 overflow-hidden">
                    {image ? (
                      <img src={image} alt={categoryName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{icon || "🍴"}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">{categoryName}</h2>
                    <p className="text-gray-500">{items.length} produse disponibile</p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-300/50 to-transparent ml-4"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {items.map((item, index) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      onAdd={handleAddToCart}
                      isAdded={addedItems[item.id]}
                      isAdding={addingToCart[item.id]}
                      getCategoryColor={getCategoryColor}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Single category grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredItems.map((item, index) => (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  onAdd={handleAddToCart}
                  isAdded={addedItems[item.id]}
                  isAdding={addingToCart[item.id]}
                  getCategoryColor={getCategoryColor}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Back to top & CTA */}
      <section className="py-16 bg-gradient-to-b from-amber-50/30 to-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 shadow-2xl shadow-amber-500/25 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                Pregătit să comanzi?
              </h2>
              <p className="text-amber-100 mb-8 max-w-md mx-auto">
                Adaugă preparatele preferate în coș și plasează comanda pentru livrare rapidă
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-8 py-3 bg-white text-amber-600 font-semibold rounded-full hover:bg-amber-50 transition-colors shadow-lg"
                >
                  Înapoi la pagina principală
                </Link>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="px-8 py-3 bg-amber-600/50 text-white font-semibold rounded-full hover:bg-amber-600/70 transition-colors border border-white/30"
                >
                  ↑ Înapoi sus
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

function MenuItemCard({ item, onAdd, isAdded, isAdding, getCategoryColor, index }) {
  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-amber-200"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Image area */}
      <div className="relative h-52 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 overflow-hidden">
        <Image
          src={item.image || "/images/default-food.jpg"}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Category badge */}
        <div className={`absolute top-4 right-4 px-3 py-1 ${getCategoryColor(item.category)} text-white text-xs font-semibold rounded-full shadow-lg`}>
          {item.categoryIcon || item.category?.icon} {item.categoryName || item.category?.name}
        </div>
        
        {/* Price badge */}
        <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
          <span className="text-xl font-bold text-amber-600">{item.price}</span>
          <span className="text-sm text-gray-500 ml-1">Lei</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-2">
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm mb-5 line-clamp-2 min-h-[40px]">
          {item.description}
        </p>

        <button
          onClick={() => onAdd(item)}
          disabled={isAdded || isAdding}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isAdded
              ? "bg-green-500 text-white"
              : isAdding
                ? "bg-amber-400 text-white"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isAdded ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Adăugat în coș!
            </>
          ) : isAdding ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Se adaugă...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Adaugă în coș
            </>
          )}
        </button>
      </div>
    </div>
  )
}
