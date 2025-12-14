"use client"

import { useEffect, useState } from "react"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders")
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        const updatedOrder = await res.json()
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const updateOrderQueue = async (orderId, queuePosition, estimatedTime) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queuePosition: parseInt(queuePosition) || null, estimatedTime })
      })

      if (res.ok) {
        const updatedOrder = await res.json()
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter)

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      PREPARING: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      READY: "bg-green-500/20 text-green-400 border-green-500/30",
      DELIVERING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      DELIVERED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30"
    }
    const labels = {
      PENDING: "În așteptare",
      CONFIRMED: "Confirmat",
      PREPARING: "În preparare",
      READY: "Gata",
      DELIVERING: "Se livrează",
      DELIVERED: "Livrat",
      CANCELLED: "Anulat"
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const statusOptions = [
    { value: "PENDING", label: "În așteptare" },
    { value: "CONFIRMED", label: "Confirmat" },
    { value: "PREPARING", label: "În preparare" },
    { value: "READY", label: "Gata" },
    { value: "DELIVERING", label: "Se livrează" },
    { value: "DELIVERED", label: "Livrat" },
    { value: "CANCELLED", label: "Anulat" }
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Comenzi</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Gestionează comenzile restaurantului</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Reîmprospătează"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters - scroll horizontal pe mobil */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap text-sm md:text-base flex-shrink-0 ${
            filter === "all"
              ? "bg-amber-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          Toate ({orders.length})
        </button>
        {statusOptions.slice(0, -1).map((opt) => {
          const count = orders.filter(o => o.status === opt.value).length
          if (count === 0) return null
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap text-sm md:text-base flex-shrink-0 ${
                filter === opt.value
                  ? "bg-amber-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {opt.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Orders List - Cards pe mobil, tabel pe desktop */}
        <div className="lg:col-span-2 space-y-3 md:space-y-0 md:bg-slate-800 md:rounded-2xl md:border md:border-slate-700 md:overflow-hidden">
          {/* Tabel pentru desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-400 font-medium">Comandă</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Client</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Total</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-slate-400">Nicio comandă găsită</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className={`border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                        selectedOrder?.id === order.id ? "bg-slate-700/50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <p className="text-white font-mono text-sm">#{order.id.slice(-8)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {order.user?.image ? (
                            <img 
                              src={order.user.image} 
                              alt={order.user.name || 'Client'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.user?.isGoogleAccount ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-600 text-slate-300'}`}>
                              {order.user?.name ? order.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white">{order.user?.name || 'Client'}</p>
                              {order.user?.isGoogleAccount && (
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm">{order.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-amber-400 font-semibold">{order.total.toFixed(2)} Lei</p>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                        {order.status === "PENDING" && order.queuePosition && (
                          <p className="text-yellow-400 text-xs mt-1">
                            {order.queuePosition} în față • {order.estimatedTime || 'N/A'}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("ro-RO", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Carduri pentru mobil */}
          <div className="md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                <svg className="w-12 h-12 text-slate-600 mb-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-slate-400">Nicio comandă găsită</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-slate-800 rounded-xl p-4 border border-slate-700 active:bg-slate-700 cursor-pointer ${
                    selectedOrder?.id === order.id ? "ring-2 ring-amber-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {order.user?.image ? (
                        <img 
                          src={order.user.image} 
                          alt={order.user.name || 'Client'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                          {order.user?.name ? order.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{order.user?.name || 'Client'}</p>
                        <p className="text-slate-400 text-xs font-mono">#{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("ro-RO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                    <span className="text-amber-400 font-semibold">{order.total.toFixed(2)} Lei</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Details - Modal pe mobil, sidebar pe desktop */}
        {selectedOrder && (
          <>
            {/* Backdrop mobil */}
            <div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSelectedOrder(null)}
            />
            <div className={`
              fixed inset-x-0 bottom-0 z-50 bg-slate-800 rounded-t-3xl border-t border-slate-700 p-4 pb-8 max-h-[85vh] overflow-y-auto
              lg:relative lg:inset-auto lg:rounded-2xl lg:border lg:p-6 lg:h-fit lg:sticky lg:top-6 lg:max-h-none
            `}>
              {/* Handle mobil */}
              <div className="lg:hidden w-12 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg font-bold text-white">Detalii comandă</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">ID Comandă</p>
                  <p className="text-white font-mono">#{selectedOrder.id.slice(-8)}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Client</p>
                  <div className="flex items-center gap-3">
                    {selectedOrder.user?.image ? (
                      <img 
                        src={selectedOrder.user.image} 
                        alt={selectedOrder.user.name || 'Client'}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm font-bold ${selectedOrder.user?.isGoogleAccount ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-600 text-slate-300'}`}>
                        {selectedOrder.user?.name ? selectedOrder.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white truncate">{selectedOrder.user?.name || 'Client'}</p>
                        {selectedOrder.user?.isGoogleAccount && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 flex items-center gap-1 flex-shrink-0">
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm truncate">{selectedOrder.user?.email}</p>
                      <p className="text-slate-400 text-sm">{selectedOrder.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-sm">Adresă</p>
                  <p className="text-white text-sm lg:text-base">{selectedOrder.deliveryAddress}</p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <p className="text-slate-400 text-sm">Notițe</p>
                    <p className="text-white text-sm lg:text-base">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-slate-400 text-sm">Metodă plată</p>
                  <p className="text-white">
                    {selectedOrder.paymentMethod === "cash" ? "Numerar" : "Card"}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Produse</p>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-white">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-slate-400">
                          {(item.price * item.quantity).toFixed(2)} Lei
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total</span>
                    <span className="text-amber-400 font-bold text-lg">
                      {selectedOrder.total.toFixed(2)} Lei
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-slate-400 text-sm mb-2">Actualizează status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Câmpuri pentru comenzi în așteptare */}
                {selectedOrder.status === "PENDING" && (
                  <div className="pt-4 border-t border-slate-700 space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-yellow-400 text-sm font-medium mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informații așteptare
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Comenzi în față</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedOrder.queuePosition || ""}
                            onChange={(e) => {
                              const newQueue = e.target.value
                              setSelectedOrder({ ...selectedOrder, queuePosition: parseInt(newQueue) || null })
                            }}
                            onBlur={(e) => updateOrderQueue(selectedOrder.id, e.target.value, selectedOrder.estimatedTime)}
                            placeholder="ex: 3"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Timp estimat</label>
                          <input
                            type="text"
                            value={selectedOrder.estimatedTime || ""}
                            onChange={(e) => {
                              const newTime = e.target.value
                              setSelectedOrder({ ...selectedOrder, estimatedTime: newTime })
                            }}
                            onBlur={(e) => updateOrderQueue(selectedOrder.id, selectedOrder.queuePosition, e.target.value)}
                            placeholder="ex: 30-45 min"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Afișare informații coadă pentru alte statusuri */}
                {selectedOrder.status !== "PENDING" && (selectedOrder.queuePosition || selectedOrder.estimatedTime) && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex gap-4 text-sm">
                      {selectedOrder.estimatedTime && (
                        <div>
                          <span className="text-slate-400">Timp estimat: </span>
                          <span className="text-white">{selectedOrder.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Placeholder pentru desktop când nu e selectată comandă */}
        {!selectedOrder && (
          <div className="hidden lg:flex bg-slate-800 rounded-2xl border border-slate-700 p-6 h-fit sticky top-6 flex-col items-center justify-center py-12 text-center">
            <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <p className="text-slate-400">Selectează o comandă</p>
            <p className="text-slate-500 text-sm">pentru a vedea detaliile</p>
          </div>
        )}
      </div>
    </div>
  )
}
