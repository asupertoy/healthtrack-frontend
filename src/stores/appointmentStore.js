import { defineStore } from 'pinia'
import appointmentApi from '../api/appointmentApi'
import { useUserStore } from './userStore'

export const useAppointmentStore = defineStore('appointmentStore', {
    state: () => ({
        appointments: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchAppointments() {
            this.loading = true
            this.error = null
            try {
                const userStore = useUserStore()
                const bookingUserId = userStore.user?.userId || userStore.userId || localStorage.getItem('userId')
                // 如果没有用户ID，就不请求，返回空列表
                if (!bookingUserId) {
                    this.appointments = []
                    return []
                }
                const data = await appointmentApi.getAppointmentsByBookingUser(bookingUserId)
                this.appointments = data
                return data
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async createAppointment(payload) {
            const created = await appointmentApi.createAppointment(payload)
            this.appointments.push(created)
            return created
        },

        async updateAppointment(payload) {
            const updated = await appointmentApi.updateAppointment(payload)
            const idx = this.appointments.findIndex(a => a.appointmentId === updated.appointmentId)
            if (idx !== -1) this.appointments[idx] = updated
            return updated
        },

        async deleteAppointment(id) {
            await appointmentApi.deleteAppointment(id)
            this.appointments = this.appointments.filter(a => a.appointmentId !== id)
        }
    }
})
