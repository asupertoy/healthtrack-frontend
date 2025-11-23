import { defineStore } from 'pinia'
import { getMonthlySummary, getHealthRecords } from '../api/healthApi'

export const useHealthStore = defineStore('health', {
    state: () => ({
        monthlySummary: null,
        healthRecords: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchMonthlySummary(userId, year, month) {
            this.loading = true
            this.error = null
            try {
                this.monthlySummary = await getMonthlySummary(userId, year, month)
            } catch (e) {
                this.error = e.message
            } finally {
                this.loading = false
            }
        },

        async fetchHealthRecords(userId) {
            this.loading = true
            this.error = null
            try {
                this.healthRecords = await getHealthRecords(userId)
            } catch (e) {
                this.error = e.message
            } finally {
                this.loading = false
            }
        }
    },
})
