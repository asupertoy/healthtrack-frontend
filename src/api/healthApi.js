import http from './http'

export default {
    // 获取用户某时间范围健康记录
    getHealthRecords(userId, startDate, endDate) {
        return http.get('/health/records', {
            params: { userId, startDate, endDate }
        })
    },

    // 创建健康记录
    createRecord(data) {
        return http.post('/health/records', data)
    },

    // 更新健康记录
    updateRecord(recordId, data) {
        return http.put(`/health/records/${recordId}`, data)
    },

    // 删除健康记录
    deleteRecord(recordId) {
        return http.delete(`/health/records/${recordId}`)
    },

    // ===============================
    // 🟦 Monthly Summary（月度摘要）
    // ===============================

    // 获取某月的摘要
    getMonthlySummary(userId, year, month) {
        return http.get('/health/summary', {
            params: { userId, year, month }
        })
    },

    // 后端生成（或刷新）月度摘要
    generateMonthlySummary(userId, year, month) {
        return http.post('/health/summary/generate', {
            userId,
            year,
            month
        })
    },

    // ===============================
    // 🟩 健康记录搜索（用于 Search.vue）
    // ===============================

    searchHealthRecords(params) {
        return http.get('/health/search', { params })
    },

    // 获取最活跃用户（摘要需求）
    getMostActiveUser() {
        return http.get('/health/stats/most-active-user')
    },

    // 获取参与最多的健康挑战（摘要需求）
    getTopChallenge() {
        return http.get('/health/stats/top-challenge')
    }
}
