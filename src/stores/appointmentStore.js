import { defineStore } from 'pinia'
import appointmentApi from '../api/appointmentApi'

export const useAppointmentStore = defineStore('appointmentStore', {
    state: () => ({
        appointments: [],
        loading: false
    }),

    actions: {
        async loadAppointments(userId) {
            this.loading = true
            try {
                const res = await appointmentApi.getAppointments(userId)
                this.appointments = res.data
            } finally {
                this.loading = false
            }
        },

        async createAppointment(data) {
            const res = await appointmentApi.createAppointment(data)
            this.appointments.push(res.data)
            return res.data
        },

        async updateAppointment(id, data) {
            const res = await appointmentApi.updateAppointment(id, data)
            const index = this.appointments.findIndex(a => a.appointmentId === id)
            if (index !== -1) this.appointments[index] = res.data
            return res.data
        },

        async deleteAppointment(id) {
            await appointmentApi.deleteAppointment(id)
            this.appointments = this.appointments.filter(a => a.appointmentId !== id)
        }
    }
})
