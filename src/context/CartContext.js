"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const { data: session, status } = useSession()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const fetchCart = useCallback(async () => {
    if (status === "loading") return
    
    if (!session?.user) {
      setCart(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCart(data)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }, [session, status])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Helper pentru a calcula totalul și itemCount
  const calculateCartTotals = (items) => {
    const total = items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    return { total, itemCount }
  }

  const addToCart = async (menuItemId, quantity = 1) => {
    if (!session?.user) {
      return { error: "Trebuie să fii autentificat pentru a adăuga produse în coș" }
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ menuItemId, quantity })
      })

      const data = await response.json()

      if (response.ok) {
        setCart(data)
        return { success: true }
      } else {
        return { error: data.error }
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      return { error: "Eroare la adăugarea în coș" }
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    // Salvăm starea veche pentru rollback
    const previousCart = cart
    
    // Optimistic update - actualizare imediată în UI
    setCart(prev => {
      if (!prev?.items) return prev
      const newItems = prev.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
      const { total, itemCount } = calculateCartTotals(newItems)
      return { ...prev, items: newItems, total, itemCount }
    })

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quantity })
      })

      const data = await response.json()

      if (response.ok) {
        // Sincronizăm cu răspunsul serverului
        setCart(data)
        return { success: true }
      } else {
        // Rollback la starea anterioară
        setCart(previousCart)
        return { error: data.error }
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      // Rollback la starea anterioară
      setCart(previousCart)
      return { error: "Eroare la actualizarea cantității" }
    }
  }

  const removeFromCart = async (itemId) => {
    // Salvăm starea veche pentru rollback
    const previousCart = cart
    
    // Optimistic update - eliminăm imediat din UI
    setCart(prev => {
      if (!prev?.items) return prev
      const newItems = prev.items.filter(item => item.id !== itemId)
      const { total, itemCount } = calculateCartTotals(newItems)
      return { ...prev, items: newItems, total, itemCount }
    })

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        // Sincronizăm cu răspunsul serverului
        setCart(data)
        return { success: true }
      } else {
        // Rollback la starea anterioară
        setCart(previousCart)
        return { error: data.error }
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      // Rollback la starea anterioară
      setCart(previousCart)
      return { error: "Eroare la ștergerea produsului" }
    }
  }

  const clearCart = async () => {
    // Salvăm starea veche pentru rollback
    const previousCart = cart
    
    // Optimistic update
    setCart(prev => ({ ...prev, items: [], total: 0, itemCount: 0 }))

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE"
      })

      if (response.ok) {
        return { success: true }
      } else {
        // Rollback
        setCart(previousCart)
        return { error: "Eroare la golirea coșului" }
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      setCart(previousCart)
      return { error: "Eroare la golirea coșului" }
    }
  }

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen(prev => !prev)

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      isOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      refetch: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
