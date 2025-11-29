import http from './http'

export default {
    // 获取所有挑战
    getChallenges(params) {
        return http.get('/challenges', { params })
    },

    // 创建挑战（后端文档为 POST /api/challenges/create）
    createChallenge(data) {
        return http.post('/challenges/create', data)
    },

    // 获取单个挑战详情（如果后端提供）
    getChallengeById(challengeId) {
        return http.get(`/challenges/${challengeId}`)
    },

    // 添加参与者
    addParticipant(challengeId, userId) {
        return http.post(`/challenges/${challengeId}/participants/${userId}`)
    },

    // 获取挑战参与者列表
    getParticipants(challengeId) {
        return http.get(`/challenges/${challengeId}/participants`)
    },

    // 移除参与者
    removeParticipant(challengeId, userId) {
        return http.delete(`/challenges/${challengeId}/participants/${userId}`)
    },

    // 更新参与者状态（后端：PUT /api/challenges/{challengeId}/participants/{userId}/status?status=...）
    updateParticipantStatus(challengeId, userId, status) {
        return http.put(`/challenges/${challengeId}/participants/${userId}/status`, null, {
            params: { status },
        })
    },
}
