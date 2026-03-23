import { defineStore } from 'pinia'
import { load, remove, save } from '../utils/storage'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: load('cart', [])
  }),
  actions: {
    addItem(product) {
      const existingItem = this.items.find(item => item.id === product.id)
      if (existingItem && existingItem.quantity >= product.stock) {
        alert(`库存不足，最多只能购买 ${product.stock} 件`)
        return
      }

      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          ...product,
          quantity: 1
        })
      }
      save('cart', this.items)
    },
    clearCart() {
      this.items = []
      remove('cart')
    }
  },
  getters: {
    totalPrice(state) {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    totalCount(state) {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    }
  }

})