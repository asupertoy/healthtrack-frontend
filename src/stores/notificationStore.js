import { defineStore } from 'pinia'

// Simple notification store to queue toast messages
export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    toasts: [] // { id, type, message, createdAt }
  }),
  actions: {
    push(type, message) {
      const id = Date.now() + Math.random()
      this.toasts.push({ id, type, message, createdAt: new Date() })
      // auto remove after 5s
      setTimeout(() => this.remove(id), 5000)
    },
    remove(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
    clear() { this.toasts = [] }
  }
})
