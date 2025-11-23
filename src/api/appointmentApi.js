import http from './http'

export default {
    // 获取用户所有预约
    getAppointments(userId) {
        return http.get(`/appointments?userId=${userId}`)
    },

    // 创建预约
    createAppointment(data) {
        return http.post('/appointments', data)
    },

    // 更新预约
    updateAppointment(id, data) {
        return http.put(`/appointments/${id}`, data)
    },

    // 删除预约
    deleteAppointment(id) {
        return http.delete(`/appointments/${id}`)
    },

    // 搜索（用于 Search.vue）
    searchAppointments(params) {
        return http.get('/appointments/search', { params })
    }
}
