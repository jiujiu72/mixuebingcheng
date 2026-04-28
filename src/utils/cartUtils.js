import { ref, watch } from 'vue'

const CART_STORAGE_KEY = 'mixuebingcheng_cart'
const CART_CHANGE_EVENT = 'mixuebingcheng_cart_changed'

const cartItems = ref([])
const isInitialized = ref(false)

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      cartItems.value = JSON.parse(stored)
    } else {
      cartItems.value = []
    }
    isInitialized.value = true
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error)
    cartItems.value = []
    isInitialized.value = true
  }
}

loadCartFromStorage()

const saveCartToStorage = () => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems.value))
    dispatchCartChangeEvent()
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error)
  }
}

const dispatchCartChangeEvent = () => {
  try {
    const event = new CustomEvent(CART_CHANGE_EVENT, {
      detail: { cartItems: [...cartItems.value] }
    })
    window.dispatchEvent(event)
  } catch (error) {
    console.error('Failed to dispatch cart change event:', error)
  }
}

const addToCart = (item, quantity = 1) => {
  if (!item) return false

  const existingItem = cartItems.value.find(i => i.id === item.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cartItems.value.push({
      ...item,
      quantity: quantity
    })
  }

  saveCartToStorage()
  return true
}

const removeFromCart = (itemId, quantity = null) => {
  const index = cartItems.value.findIndex(i => i.id === itemId)

  if (index === -1) return false

  if (quantity === null || quantity >= cartItems.value[index].quantity) {
    cartItems.value.splice(index, 1)
  } else {
    cartItems.value[index].quantity -= quantity
  }

  saveCartToStorage()
  return true
}

const updateCartItemQuantity = (itemId, quantity) => {
  const item = cartItems.value.find(i => i.id === itemId)

  if (!item) return false

  if (quantity <= 0) {
    return removeFromCart(itemId)
  }

  item.quantity = quantity
  saveCartToStorage()
  return true
}

const clearCart = () => {
  cartItems.value = []
  saveCartToStorage()
  return true
}

const getCartItemById = (itemId) => {
  return cartItems.value.find(i => i.id === itemId) || null
}

const getTotalQuantity = () => {
  return cartItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

const getTotalPrice = () => {
  return cartItems.value.reduce((sum, item) => {
    const price = item.price || item.seckillPrice || item.originalPrice || 0
    return sum + (price * (item.quantity || 0))
  }, 0)
}

const hasItems = () => {
  return cartItems.value.length > 0
}

const useCart = () => {
  if (!isInitialized.value) {
    loadCartFromStorage()
  }

  const handleStorageChange = (e) => {
    if (e.key === CART_STORAGE_KEY) {
      try {
        const newValue = e.newValue ? JSON.parse(e.newValue) : []
        if (JSON.stringify(newValue) !== JSON.stringify(cartItems.value)) {
          cartItems.value = newValue
        }
      } catch (error) {
        console.error('Failed to handle storage change:', error)
      }
    }
  }

  const handleCartChangeEvent = (e) => {
    try {
      const newValue = e.detail?.cartItems || []
      if (JSON.stringify(newValue) !== JSON.stringify(cartItems.value)) {
        cartItems.value = newValue
      }
    } catch (error) {
      console.error('Failed to handle cart change event:', error)
    }
  }

  onMounted(() => {
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(CART_CHANGE_EVENT, handleCartChangeEvent)
  })

  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener(CART_CHANGE_EVENT, handleCartChangeEvent)
  })

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartItemById,
    getTotalQuantity,
    getTotalPrice,
    hasItems,
    loadCartFromStorage,
    saveCartToStorage
  }
}

const onMounted = (fn) => {
  if (typeof fn === 'function') {
    fn()
  }
}

const onUnmounted = () => {}

export {
  cartItems,
  loadCartFromStorage,
  saveCartToStorage,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  getCartItemById,
  getTotalQuantity,
  getTotalPrice,
  hasItems,
  useCart
}
