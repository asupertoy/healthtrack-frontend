import { defineStore } from 'pinia'
import userApi from '../api/userApi'

export const useUserStore = defineStore('userStore', {
    state: () => ({
        user: null,
        emails: [],
        phones: [],
        providers: [],
        loading: false
    }),

    actions: {
        async login(email, password) {
            this.loading = true
            try {
                const res = await userApi.login({ email, password })
                this.user = res.data
                return res.data
            } finally {
                this.loading = false
            }
        },

        async loadUser(userId) {
            const res = await userApi.getUser(userId)
            this.user = res.data
            this.emails = res.data.emails || []
            this.phones = res.data.phones || []
            this.providers = res.data.providers || []
        },

        async updateUser(data) {
            const res = await userApi.updateUser(this.user.userId, data)
            this.user = res.data
            return res.data
        },

        // email ops
        async addEmail(email) {
            const res = await userApi.addEmail(this.user.userId, email)
            this.emails.push(res.data)
            return res.data
        },

        async removeEmail(emailId) {
            await userApi.removeEmail(emailId)
            this.emails = this.emails.filter(e => e.emailId !== emailId)
        },

        // provider link
        async linkProvider(providerId) {
            const res = await userApi.linkProvider(this.user.userId, providerId)
            this.providers.push(res.data)
            return res.data
        },

        async unlinkProvider(linkId) {
            await userApi.unlinkProvider(linkId)
            this.providers = this.providers.filter(p => p.linkId !== linkId)
        }
    }
})
