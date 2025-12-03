import http from './http'

export default {
    // 获取所有挑战
    getChallenges(params) {
        return http.get('/challenges', { params }).then(res => res.data)
    },

    // 获取挑战统计数据（参与人数/完成人数）
    getChallengeStats() {
        return http.get('/challenges/stats').then(res => res.data)
    },

    // 根据用户ID获取该用户参与的挑战
    getChallengesByUser(userId) {
        return http.get('/challenges/by-user', { params: { userId } }).then(res => res.data)
    },

    // 获取指定用户未参加的挑战
    getNotJoinedChallengesByUser(userId) {
        return http.get('/challenges/not-joined-by-user', { params: { userId } }).then(res => res.data)
    },

    // 创建挑战（后端文档为 POST /api/challenges/create）
    createChallenge(data) {
        return http.post('/challenges/create', data).then(res => res.data)
    },

    // 获取单个挑战详情（如果后端提供）
    getChallengeById(challengeId) {
        return http.get(`/challenges/${challengeId}`).then(res => res.data)
    },

    // 添加参与者
    addParticipant(challengeId, userId) {
        return http.post(`/challenges/${challengeId}/participants/${userId}`).then(res => res.data)
    },

    // 获取挑战参与者列表
    getParticipants(challengeId) {
        return http.get(`/challenges/${challengeId}/participants`).then(res => res.data)
    },

    // 移除参与者
    removeParticipant(challengeId, userId) {
        return http.delete(`/challenges/${challengeId}/participants/${userId}`).then(res => res.data)
    },

    // 更新参与者状态（后端：PUT /api/challenges/{challengeId}/participants/{userId}/status?status=...）
    updateParticipantStatus(challengeId, userId, status) {
        return http.put(`/challenges/${challengeId}/participants/${userId}/status`, null, {
            params: { status },
        }).then(res => res.data)
    },
}
