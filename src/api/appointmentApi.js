import http from './http'

export default {
    // 获取所有预约（不带过滤）
    getAppointments() {
        return http.get('/appointments').then(res => res.data)
    },

    // 根据预订用户ID获取该用户的所有预约
    getAppointmentsByBookingUser(bookingUserId) {
        return http.get('/appointments/by-booking-user', { params: { bookingUserId } }).then(res => res.data)
    },

    // 获取单个预约
    getAppointmentById(id) {
        return http.get(`/appointments/${id}`).then(res => res.data)
    },

    // 创建预约：使用后端的 CreateAppointmentRequest DTO
    createAppointment(payload) {
        // 这里假定 payload 已经是 { bookingUserId, providerId, scheduledAt, consultationType, memo }
        return http.post('/appointments', payload).then(res => res.data)
    },

    // 更新预约：后端要求带 appointmentId 的完整 Appointment JSON
    updateAppointment(data) {
        return http.put('/appointments', data).then(res => res.data)
    },

    // 删除预约
    deleteAppointment(id) {
        return http.delete(`/appointments/${id}`).then(res => res.data)
    },

    // 取消预约
    cancelAppointment(id, data) {
        // 调用后端 PATCH /api/appointments/{id}/cancel 取消预约
        return http.patch(`/appointments/${id}/cancel`, data).then(res => res.data)
    },
}
