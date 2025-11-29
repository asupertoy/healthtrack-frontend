import http from './http'

export default {
    // 登录（电话或邮箱 + 密码）
    login(payload) {
        // payload: { phone?, email?, password }
        return http.post('/auth/login', payload).then(res => res.data)
    },

    // 刷新 token
    refresh(data) {
        // data: { refreshToken }
        return http.post('/auth/refresh', data).then(res => res.data)
    },

    // ping（调试用）
    ping() {
        return http.get('/auth/ping').then(res => res.data)
    },
}
