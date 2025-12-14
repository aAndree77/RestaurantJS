"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/orders")
      ])

      const products = await productsRes.json()
      const categories = await categoriesRes.json()
      const orders = await ordersRes.json()

      setStats({
        products: Array.isArray(products) ? products.length : 0,
        categories: Array.isArray(categories) ? categories.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        pendingOrders: Array.isArray(orders) ? orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED").length : 0
      })

      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      label: "Produse", 
      value: stats.products, 
      icon: "📦", 
      color: "from-blue-500 to-blue-600",
      href: "/admin/products"
    },
    { 
      label: "Categorii", 
      value: stats.categories, 
      icon: "🏷️", 
      color: "from-purple-500 to-purple-600",
      href: "/admin/categories"
    },
    { 
      label: "Comenzi totale", 
      value: stats.orders, 
      icon: "📋", 
      color: "from-emerald-500 to-emerald-600",
      href: "/admin/orders"
    },
    { 
      label: "Comenzi în așteptare", 
      value: stats.pendingOrders, 
      icon: "⏳", 
      color: "from-amber-500 to-orange-500",
      href: "/admin/orders?status=pending"
    },
  ]

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
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Bine ai venit! 👋</h1>
        <p className="text-slate-400">Iată o privire de ansamblu asupra restaurantului tău.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Comenzi recente</h2>
            <Link href="/admin/orders" className="text-amber-400 hover:text-amber-300 text-sm">
              Vezi toate →
            </Link>
          </div>
          <div className="divide-y divide-slate-700">
            {recentOrders.length === 0 ? (
              <p className="px-6 py-8 text-center text-slate-400">Nu există comenzi încă.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{order.orderNumber}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleString('ro-RO')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-amber-400">{order.total?.toFixed(0)} Lei</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "DELIVERED" ? "bg-green-500/20 text-green-400" :
                        order.status === "CANCELLED" ? "bg-red-500/20 text-red-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="font-semibold text-white mb-4">Acțiuni rapide</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="flex flex-col items-center justify-center p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600 hover:border-amber-500/50"
            >
              <span className="text-3xl mb-2">➕</span>
              <span className="text-sm text-slate-300">Produs nou</span>
            </Link>
            <Link
              href="/admin/categories"
              className="flex flex-col items-center justify-center p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600 hover:border-amber-500/50"
            >
              <span className="text-3xl mb-2">🏷️</span>
              <span className="text-sm text-slate-300">Categorii</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex flex-col items-center justify-center p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600 hover:border-amber-500/50"
            >
              <span className="text-3xl mb-2">📋</span>
              <span className="text-sm text-slate-300">Comenzi</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="flex flex-col items-center justify-center p-6 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600 hover:border-amber-500/50"
            >
              <span className="text-3xl mb-2">🌐</span>
              <span className="text-sm text-slate-300">Vezi site</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
