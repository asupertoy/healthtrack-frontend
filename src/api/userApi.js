import http from './http'

export default {
    // 用户模块基础 CRUD
    createUser(payload) {
        return http.post('/users', payload).then(res => res.data)
    },

    getUsers() {
        return http.get('/users').then(res => res.data)
    },

    getUserById(userId) {
        return http.get(`/users/${userId}`).then(res => res.data)
    },

    deleteUser(userId) {
        return http.delete(`/users/${userId}`).then(res => res.data)
    },

    updateUser(userId, payload) {
        // 后端规范没有单独写更新，可按实际接口调整；这里假设 PUT /api/users/{id}
        return http.put(`/users/${userId}`, payload).then(res => res.data)
    },

    // 邮箱相关（按你的邮箱模块 API 可能单独有 /api/emails，这里保留用户下挂方式，具体按后端实现调整）
    addEmail(userId, { emailAddress }) {
        // 如果实际后端是 /api/emails/create，可以改为 http.post('/emails/create', { userId, emailAddress })
        return http.post(`/users/${userId}/emails`, { emailAddress }).then(res => res.data)
    },

    removeEmail(emailId) {
        // 若后端为 DELETE /api/emails/{id}
        return http.delete(`/emails/${emailId}`).then(res => res.data)
    },

    // 手机号相关（如果有对应后端接口）
    addPhone(userId, { phoneNumber }) {
        return http.post(`/users/${userId}/phones`, { phoneNumber }).then(res => res.data)
    },

    removePhone(phoneId) {
        return http.delete(`/users/phones/${phoneId}`).then(res => res.data)
    },

    // User-Provider 关联：使用后端的 provider-links 子模块
    addProviderLink(userId, providerId, isPrimary = false) {
        return http.post(`/users/${userId}/provider-links`, null, {
            params: { providerId, isPrimary },
        }).then(res => res.data)
    },

    getProviderLinks(userId) {
        return http.get(`/users/${userId}/provider-links`).then(res => res.data)
    },

    deleteProviderLink(linkId) {
        return http.delete(`/users/provider-links/${linkId}`).then(res => res.data)
    },
}
