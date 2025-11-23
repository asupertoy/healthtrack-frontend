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
                const data = await userApi.login({ email, password })
                this.user = data
                this.emails = data.emails || []
                this.phones = data.phones || []
                this.providers = data.providers || []
                return data
            } finally {
                this.loading = false
            }
        },

        async loadUser(userId) {
            const data = await userApi.getUser(userId)
            this.user = data
            this.emails = data.emails || []
            this.phones = data.phones || []
            this.providers = data.providers || []
        },

        async updateUser(payload) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const data = await userApi.updateUser(this.user.userId, payload)
            this.user = data
            return data
        },

        async addEmail(email) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const data = await userApi.addEmail(this.user.userId, email)
            this.emails.push(data)
            return data
        },

        async removeEmail(emailId) {
            await userApi.removeEmail(emailId)
            this.emails = this.emails.filter(e => e.emailId !== emailId)
        },

        async addPhone(phone) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const data = await userApi.addPhone(this.user.userId, phone)
            this.phones.push(data)
            return data
        },

        async removePhone(phoneId) {
            await userApi.removePhone(phoneId)
            this.phones = this.phones.filter(p => p.phoneId !== phoneId)
        },

        async linkProvider(providerId) {
            if (!this.user?.userId) throw new Error('No user loaded')
            const data = await userApi.linkProvider(this.user.userId, providerId)
            this.providers.push(data)
            return data
        },

        async unlinkProvider(linkId) {
            await userApi.unlinkProvider(linkId)
            this.providers = this.providers.filter(p => p.linkId !== linkId)
        }
    }
})
