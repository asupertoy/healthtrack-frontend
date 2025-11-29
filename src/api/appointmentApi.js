import http from './http'

export default {
    // 获取所有预约（后端可根据当前登录用户过滤）
    getAppointments(params) {
        return http.get('/appointments', { params }).then(res => res.data)
    },

    // 获取单个预约
    getAppointmentById(id) {
        return http.get(`/appointments/${id}`).then(res => res.data)
    },

    // 创建预约
    createAppointment(data) {
        // 后端示例请求体见文档
        return http.post('/appointments', data).then(res => res.data)
    },

    // 更新预约：后端要求带 appointmentId 的完整 Appointment JSON
    updateAppointment(data) {
        return http.put('/appointments', data).then(res => res.data)
    },

    // 删除预约
    deleteAppointment(id) {
        return http.delete(`/appointments/${id}`).then(res => res.data)
    },
}
