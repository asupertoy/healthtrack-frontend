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
                this.accessToken = data.accessToken || null
                this.refreshToken = data.refreshToken || null
                this.userId = data.userId || null

                if (this.accessToken) localStorage.setItem('token', this.accessToken)
                if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken)
                if (this.userId) {
                    localStorage.setItem('userId', this.userId)
                    const userDetail = await userApi.getUserById(this.userId)
                    this.user = userDetail
                    // 通过 userId 查询该用户已有的邮箱记录
                    try {
                        const emailList = await userApi.getEmailsByUser(this.userId)
                        this.emails = emailList || []
                    } catch {
                        this.emails = []
                    }
                    // 用 user.phone / phoneVerified 映射一条 phones 记录，方便 UI 展示
                    this.phones = userDetail.phone ? [{
                        phoneId: userDetail.userId,
                        phoneNumber: userDetail.phone,
                        verified: !!userDetail.phoneVerified,
                    }] : []
                    // 通过 provider-links API 加载当前用户的关联医生/机构
                    try {
                        const links = await userApi.getProviderLinks(this.userId)
                        this.providers = links || []
                    } catch {
                        this.providers = []
                    }
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
                try {
                    const emailList = await userApi.getEmailsByUser(this.userId)
                    this.emails = emailList || []
                } catch {
                    this.emails = []
                }
                this.phones = userDetail.phone ? [{
                    phoneId: userDetail.userId,
                    phoneNumber: userDetail.phone,
                    verified: !!userDetail.phoneVerified,
                }] : []
                try {
                    const links = await userApi.getProviderLinks(this.userId)
                    this.providers = links || []
                } catch {
                    this.providers = []
                }
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
            // Try patching the user
            const data = await userApi.updateUser(this.user.userId, payload)
            // Some backends may return an empty body for PATCH; ensure we have a full user object
            if (data && (data.userId || data.user_id)) {
                this.user = data
                return this.user
            }
            // Fallback: re-fetch the user by ID to get a complete object
            try {
                const refreshed = await userApi.getUserById(this.user.userId)
                this.user = refreshed
                return this.user
            } catch (e) {
                // If re-fetch fails, still try to preserve previous user state
                return this.user
            }
        },

        // 邮箱相关
        async addEmail(emailAddress) {
            if (!this.user?.userId) throw new Error('No user loaded')
            // 使用 /api/emails/create 在 emails 表中创建记录
            const email = await userApi.createEmailForUser(this.user.userId, emailAddress)
            this.emails.push(email)
            return email
        },

        async removeEmail(emailId) {
            // call backend DELETE /api/emails/{id} and update local cache
            if (!this.user?.userId) throw new Error('No user loaded')
            try {
                // include current userId as query param for backend ownership validation
                await userApi.removeEmail(emailId, this.user.userId)
            } catch (e) {
                // bubble up error so UI can show feedback
                throw e
            }
            this.emails = this.emails.filter(e => e.emailId !== emailId && e.id !== emailId)
        },

        // 标记邮箱为已验证：调用后端 /api/emails/verify，并刷新本地 emails
        async verifyEmail(emailAddress) {
            if (!this.user?.userId) throw new Error('No user loaded')
            await userApi.verifyEmail(emailAddress)
            // 重新拉取该用户的邮箱列表，确保与 DB 一致
            const list = await userApi.getEmailsByUser(this.user.userId)
            this.emails = list || []
            return this.emails
        },

        // 取消邮箱验证：调用 /api/emails/unverify 并刷新本地 emails
        async unverifyEmail(emailAddress) {
            if (!this.user?.userId) throw new Error('No user loaded')
            await userApi.unverifyEmail(emailAddress)
            const list = await userApi.getEmailsByUser(this.user.userId)
            this.emails = list || []
            return this.emails
        },

        // 手机号相关
        async addPhone(phoneNumber) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const phone = await userApi.addPhone(this.user.userId, { phoneNumber })
            this.phones.push(phone)
            return phone
        },

        async removePhone(phoneId) {
            if (!this.user?.userId) throw new Error('No user loaded')
            try {
                await userApi.removePhone(phoneId, this.user.userId)
            } catch (e) {
                throw e
            }
            this.phones = this.phones.filter(p => p.phoneId !== phoneId && p.id !== phoneId)
        },

        // 标记手机号为已验证：PATCH /api/users/{id} 更新 phoneVerified/phoneVerifiedAt
        async verifyPhone() {
            if (!this.user?.userId) throw new Error('No user loaded')
            const now = new Date().toISOString().slice(0, 19)
            const payload = { phoneVerified: true, phoneVerifiedAt: now }
            const updated = await userApi.verifyPhone(this.user.userId, payload)
            // 如果后端返回完整 user，用它；否则保守更新本地 user
            this.user = Object.assign({}, this.user, updated || {}, payload)
            this.phones = [{ phoneId: this.user.userId, phoneNumber: this.user.phone, verified: true }]
            return this.phones
        },

        // 取消手机号验证：设置 phoneVerified=false, phoneVerifiedAt=null
        async unverifyPhone() {
            if (!this.user?.userId) throw new Error('No user loaded')
            const payload = { phoneVerified: false, phoneVerifiedAt: null }
            const updated = await userApi.unverifyPhone(this.user.userId, payload)
            this.user = Object.assign({}, this.user, updated || {}, payload)
            this.phones = [{ phoneId: this.user.userId, phoneNumber: this.user.phone, verified: false }]
            return this.phones
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
            this.providers = this.providers.filter(p => p.id !== linkId && p.linkId !== linkId)
        },

        // 标记 provider-link 为已验证：PATCH /api/users/provider-links/{linkId} 并刷新列表
        async verifyProviderLink(linkId) {
            if (!this.user?.userId) throw new Error('No user loaded')
            await userApi.verifyProviderLink(linkId, { verificationStatus: 'verified' })
            const links = await userApi.getProviderLinks(this.user.userId)
            this.providers = links || []
            return this.providers
        },

        // 取消 provider-link 验证：标记为未验证并刷新列表
        async unverifyProviderLink(linkId) {
            if (!this.user?.userId) throw new Error('No user loaded')
            await userApi.unverifyProviderLink(linkId, { verificationStatus: 'unverified' })
            const links = await userApi.getProviderLinks(this.user.userId)
            this.providers = links || []
            return this.providers
        },

        // 明确暴露一个按 userId 拉取 provider-links 的方法，供 UI 手动刷新使用
        async fetchProviderLinks() {
            if (!this.userId) throw new Error('No userId available')
            try {
                const links = await userApi.getProviderLinks(this.userId)
                this.providers = links || []
                return this.providers
            } catch (e) {
                this.providers = []
                throw e
            }
        },
    },
})
