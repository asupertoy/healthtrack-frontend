import http from './http'

export default {
    // 登录
    login(data) {
        return http.post('/auth/login', data)
    },

    // 获取用户资料
    getUser(userId) {
        return http.get(`/users/${userId}`)
    },

    // 更新用户资料
    updateUser(userId, payload) {
        return http.put(`/users/${userId}`, payload)
    },

    // 添加邮箱
    addEmail(userId, email) {
        return http.post(`/users/${userId}/emails`, { email })
    },

    // 删除邮箱
    removeEmail(emailId) { // renamed for store consistency
        return http.delete(`/users/emails/${emailId}`)
    },

    // 添加手机号
    addPhone(userId, phone) {
        return http.post(`/users/${userId}/phones`, { phone })
    },

    // 删除手机号
    removePhone(phoneId) { // renamed for consistency
        return http.delete(`/users/phones/${phoneId}`)
    },

    // 用户关联医疗机构
    linkProvider(userId, providerId) { // renamed to match store usage
        return http.post(`/users/${userId}/providers/${providerId}`)
    },

    // 取消关联医疗机构
    unlinkProvider(linkId) { // renamed to match store usage; assuming linkId is relation id
        return http.delete(`/users/providers/${linkId}`)
    },
}
