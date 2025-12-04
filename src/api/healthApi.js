import http from './http'

export default {
    // 健康记录模块（/api/health-records）

    // 为指定用户创建健康记录
    createRecord(userId, data) {
        return http.post(`/health-records/${userId}`, data).then(res => res.data)
    },

    // 获取某用户的健康记录列表
    getHealthRecords(userId) {
        return http.get(`/health-records/${userId}`).then(res => res.data)
    },

    // 更新健康记录（请求体带 id）
    updateRecord(data) {
        return http.put('/health-records', data).then(res => res.data)
    },

    // 删除健康记录
    deleteRecord(recordId) {
        return http.delete(`/health-records/${recordId}`).then(res => res.data)
    },

    // MonthlySummary 子模块（/api/health-records/summary）

    // 添加月度汇总
    addMonthlySummary(userId, year, month, metricsJson) {
        // metricsJson 是字符串（可以是 JSON 文本）
        return http.post(`/health-records/summary/${userId}`, metricsJson, {
            params: { year, month },
            headers: { 'Content-Type': 'application/json' },
        }).then(res => res.data)
    },

    // 获取某用户的月度汇总列表
    getMonthlySummaries(userId) {
        return http.get(`/health-records/summary/${userId}`).then(res => res.data)
    },

    // 健康记录排行榜：按健康记录数统计最活跃用户
    // 对应后端 GET /api/health-records/leaderboard?top=1
    getHealthRecordLeaderboard(top = 1) {
        return http.get('/health-records/leaderboard', { params: { top } }).then(res => res.data)
    },

    // 健康记录搜索：按 userId + 可选开始/结束日期过滤
    // 对应后端 GET /api/health-records/search?userId=1&startDate=2025-11-01&endDate=2025-11-30
    searchHealthRecords(query) {
        const params = {
            userId: query.userId || undefined,
            startDate: query.startDate || undefined,
            endDate: query.endDate || undefined,
        }
        return http.get('/health-records/search', { params }).then(res => res.data)
    },
}
