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
        // Use PATCH for partial updates (backend expects PATCH for updating user fields)
        return http.patch(`/users/${userId}`, payload).then(res => res.data)
    },

    // 邮箱相关（如果未来在 /users/{id}/emails 下挂，可使用此方法；当前实际使用 EmailController 的接口）
    addEmail(userId, { emailAddress }) {
        return http.post(`/users/${userId}/emails`, { emailAddress }).then(res => res.data)
    },

    removeEmail(emailId, userId) {
        // Some backends expect DELETE with JSON body { userId }, others expect ?userId=...
        // Try sending a DELETE with body first, then fall back to query param.
        const bodyCfg = userId ? { data: { userId }, headers: { 'Content-Type': 'application/json' } } : {}
        return http.request({ method: 'delete', url: `/emails/${emailId}`, ...bodyCfg })
            .then(res => res.data)
            .catch(async err => {
                // fallback: try query param approach
                try {
                    const cfg = userId ? { params: { userId } } : undefined
                    const res2 = await http.delete(`/emails/${emailId}`, cfg)
                    return res2.data
                } catch (err2) {
                    // prefer original error for debugging
                    throw err
                }
            })
    },

    // 手机号相关（如果有对应后端接口）
    addPhone(userId, { phoneNumber }) {
        return http.post(`/users/${userId}/phones`, { phoneNumber }).then(res => res.data)
    },

    removePhone(phoneId) {
        return http.delete(`/users/phones/${phoneId}`).then(res => res.data)
    },

    // 通过 EmailController 创建邮箱记录（/api/emails/create）
    createEmailForUser(userId, emailAddress) {
        // 对应后端 POST /api/emails/create
        // Ensure we include userId in payload and provide both email and emailAddress keys
        const payload = {userId, user_id: userId}
        if (emailAddress !== undefined) {
            payload.emailAddress = emailAddress
            payload.email = emailAddress
        }
        return http.post('/emails/create', payload).then(res => res.data);
    },

    unverifyEmail(emailAddress) {
        return http.post('/emails/unverify', null, { params: { emailAddress } }).then(res => res.data)
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

    // 通过 userId 查询该用户的所有邮箱记录：GET /api/emails/by-user?userId=...
    getEmailsByUser(userId) {
        return http.get('/emails/by-user', { params: { userId } }).then(res => res.data)
    },
}
