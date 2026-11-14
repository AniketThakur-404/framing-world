"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ProductCard } from "@/components/product/productData"

export type CartItem = ProductCard & {
  size: string
  quantity: number
}

type CartContextType = {
  cart: CartItem[]
  isLoaded: boolean
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (product: ProductCard, size: string) => void
  removeFromCart: (id: string, size: string) => void
  updateQuantity: (id: string, size: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("framingworld-cart")
      if (saved) {
        setCart(JSON.parse(saved))
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage when cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("framingworld-cart", JSON.stringify(cart))
      } catch (e) {
        console.warn("Failed to save cart to localStorage", e)
      }
    }
  }, [cart, isLoaded])


  const addToCart = (product: ProductCard, size: string) => {
    // Products without options have a single variant; the label is only for display.
    const resolvedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard")
    const resolvedProduct: ProductCard = {
      ...product,
      title: product.title || "Framing World product",
      // Each option (size, glazing…) has its own price.
      price:
        product.priceBySize?.[resolvedSize] ??
        (product.price && product.price !== "N/A" ? product.price : "₹0"),
      image: product.image || "/images/home/tile-best-selling-frames.jpg",
    }


    setCart((prev) => {
      const existing = prev.find((item) => item.id === resolvedProduct.id && item.size === resolvedSize)
      if (existing) {
        return prev.map((item) =>
          item.id === resolvedProduct.id && item.size === resolvedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...resolvedProduct, size: resolvedSize, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)))
  }

  const updateQuantity = (id: string, size: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => !(item.id === id && item.size === size))
      }
      return prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    })
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, isLoaded, isCartOpen, setIsCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
