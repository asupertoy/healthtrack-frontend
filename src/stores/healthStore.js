import { defineStore } from 'pinia'
import healthApi from '../api/healthApi'

export const useHealthStore = defineStore('health', {
    state: () => ({
        monthlySummaries: [],
        healthRecords: [],
        loading: false,
        error: null,
    }),

    actions: {
        // 获取某用户所有月度汇总，然后前端可以按 year/month 过滤
        async fetchMonthlySummaries(userId) {
            this.loading = true
            this.error = null
            try {
                const list = await healthApi.getMonthlySummaries(userId)
                this.monthlySummaries = list
                return list
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async addMonthlySummary(userId, year, month, metricsJson) {
            return await healthApi.addMonthlySummary(userId, year, month, metricsJson)
        },

        async fetchHealthRecords(userId) {
            this.loading = true
            this.error = null
            try {
                const list = await healthApi.getHealthRecords(userId)
                this.healthRecords = list
                return list
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },
    },
})
