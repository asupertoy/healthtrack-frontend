import { defineStore } from 'pinia'
import healthApi from '../api/healthApi'

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
                this.monthlySummary = await healthApi.getMonthlySummary(userId, year, month)
                return this.monthlySummary
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async generateMonthlySummary(userId, year, month) {
            return await healthApi.generateMonthlySummary(userId, year, month)
        },

        async fetchHealthRecords(userId, startDate, endDate) {
            this.loading = true
            this.error = null
            try {
                this.healthRecords = await healthApi.getHealthRecords(userId, startDate, endDate)
                return this.healthRecords
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async searchRecords(params) {
            return await healthApi.searchHealthRecords(params)
        }
    },
})
