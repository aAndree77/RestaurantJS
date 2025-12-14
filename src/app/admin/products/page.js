"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories")
      ])
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      
      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest produs?")) return

    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setDeleteId(null)
    }
  }

  const filteredProducts = filter === "all" 
    ? products 
    : products.filter(p => p.categoryId === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-400/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Produse</h1>
          <p className="text-slate-400">{products.length} produse în total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Produs nou
        </Link>
      </div>

      {/* Filters - scroll horizontal pe mobil */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap scrollbar-hide">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
            filter === "all"
              ? "bg-amber-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Toate ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filter === cat.id
                ? "bg-amber-500 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {cat.name} ({products.filter(p => p.categoryId === cat.id).length})
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
          <span className="text-5xl mb-4 block">📦</span>
          <p className="text-slate-400 mb-4">Nu există produse în această categorie.</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Adaugă primul produs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all group"
            >
              <div className="relative h-48">
                <Image
                  src={product.image || "/images/default-food.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {product.available ? "Disponibil" : "Indisponibil"}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.category?.color || 'bg-gray-500'} text-white`}>
                    {product.category?.name}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <span className="text-amber-400 font-bold whitespace-nowrap">{product.price} Lei</span>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{product.description}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="flex-1 px-3 py-2 text-center text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Editează
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteId === product.id}
                    className="px-3 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    {deleteId === product.id ? "..." : "Șterge"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
