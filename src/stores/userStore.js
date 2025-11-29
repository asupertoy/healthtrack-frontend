import { defineStore } from 'pinia'
import userApi from '../api/userApi'
import authApi from '../api/authApi'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        user: null,
        emails: [],
        phones: [],
        providers: [],
        loading: false,
        accessToken: localStorage.getItem('token') || null,
        refreshToken: localStorage.getItem('refreshToken') || null,
        userId: localStorage.getItem('userId') || null,
    }),

    getters: {
        isAuthenticated: state => !!state.accessToken,
    },

    actions: {
        // 登录（支持 email 或 phone）
        async login(identifier, password) {
            this.loading = true
            try {
                const payload = {}
                if (identifier?.includes && identifier.includes('@')) {
                    payload.email = identifier
                } else {
                    payload.phone = identifier
                }
                payload.password = password

                const data = await authApi.login(payload)
                // 后端文档：{ accessToken, refreshToken, tokenType, userId }
                this.accessToken = data.accessToken || null
                this.refreshToken = data.refreshToken || null
                this.userId = data.userId || null

                if (this.accessToken) {
                    localStorage.setItem('token', this.accessToken)
                }
                if (this.refreshToken) {
                    localStorage.setItem('refreshToken', this.refreshToken)
                }
                if (this.userId) {
                    localStorage.setItem('userId', this.userId)
                    // 登录后拉一次用户详情
                    const userDetail = await userApi.getUserById(this.userId)
                    this.user = userDetail
                    this.emails = userDetail.emails || []
                    this.phones = userDetail.phones || []
                    this.providers = userDetail.providers || []
                }

                return data
            } finally {
                this.loading = false
            }
        },

        // 从本地存储中恢复用户（在应用启动时调用）
        async restoreSession() {
            if (this.userId && !this.user) {
                const userDetail = await userApi.getUserById(this.userId)
                this.user = userDetail
                this.emails = userDetail.emails || []
                this.phones = userDetail.phones || []
                this.providers = userDetail.providers || []
            }
        },

        // 登出
        logout() {
            this.user = null
            this.emails = []
            this.phones = []
            this.providers = []
            this.accessToken = null
            this.refreshToken = null
            this.userId = null
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('userId')
        },

        // token 刷新供 http 拦截器调用
        async refreshTokens() {
            if (!this.refreshToken) {
                throw new Error('No refresh token')
            }
            const data = await authApi.refresh({ refreshToken: this.refreshToken })
            this.accessToken = data.accessToken || null
            this.refreshToken = data.refreshToken || null
            if (this.accessToken) {
                localStorage.setItem('token', this.accessToken)
            }
            if (this.refreshToken) {
                localStorage.setItem('refreshToken', this.refreshToken)
            }
            if (data.userId) {
                this.userId = data.userId
                localStorage.setItem('userId', this.userId)
            }
            return data
        },

        // 更新用户基本信息
        async updateUser(payload) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const data = await userApi.updateUser(this.user.userId, payload)
            this.user = data
            return data
        },

        // 邮箱相关
        async addEmail(emailAddress) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const email = await userApi.addEmail(this.user.userId, { emailAddress })
            this.emails.push(email)
            return email
        },

        async removeEmail(emailId) {
            await userApi.removeEmail(emailId)
            this.emails = this.emails.filter(e => e.emailId !== emailId)
        },

        // 手机号相关
        async addPhone(phoneNumber) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const phone = await userApi.addPhone(this.user.userId, { phoneNumber })
            this.phones.push(phone)
            return phone
        },

        async removePhone(phoneId) {
            await userApi.removePhone(phoneId)
            this.phones = this.phones.filter(p => p.phoneId !== phoneId)
        },

        // Provider 关联（使用 /users/{userId}/provider-links）
        async linkProvider(providerId, isPrimary = false) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const link = await userApi.addProviderLink(this.user.userId, providerId, isPrimary)
            this.providers.push(link)
            return link
        },

        async unlinkProvider(linkId) {
            await userApi.deleteProviderLink(linkId)
            this.providers = this.providers.filter(p => p.id !== linkId)
        },
    },
})
