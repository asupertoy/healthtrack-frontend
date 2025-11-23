import http from './http'

export default {
    // 获取所有挑战
    getChallenges() {
        return http.get('/challenges')
    },

    // 创建挑战
    createChallenge(data) {
        return http.post('/challenges', data)
    },

    // 用户加入挑战
    joinChallenge(challengeId, userId) {
        return http.post(`/challenges/${challengeId}/join`, { userId })
    },

    // 查看挑战详情（参与者列表）
    getChallengeDetail(challengeId) {
        return http.get(`/challenges/${challengeId}`)
    },

    // 用户退出挑战
    leaveChallenge(participationId) {
        return http.delete(`/challenges/participants/${participationId}`)
    }
}
