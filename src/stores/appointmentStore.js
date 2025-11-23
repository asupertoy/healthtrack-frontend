import { defineStore } from 'pinia'
import appointmentApi from '../api/appointmentApi'

export const useAppointmentStore = defineStore('appointmentStore', {
    state: () => ({
        appointments: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchAppointments(userId) {
            this.loading = true
            this.error = null
            try {
                const data = await appointmentApi.getAppointments(userId)
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
            const data = await appointmentApi.createAppointment(payload)
            this.appointments.push(data)
            return data
        },

        async updateAppointment(id, payload) {
            const data = await appointmentApi.updateAppointment(id, payload)
            const index = this.appointments.findIndex(a => a.appointmentId === id)
            if (index !== -1) this.appointments[index] = data
            return data
        },

        async deleteAppointment(id) {
            await appointmentApi.deleteAppointment(id)
            this.appointments = this.appointments.filter(a => a.appointmentId !== id)
        }
    }
})
