import { defineStore } from 'pinia'
import familyApi from '../api/familyApi'

export const useFamilyStore = defineStore('familyStore', {
    state: () => ({
        groups: [],
        members: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchGroups() {
            this.loading = true
            this.error = null
            try {
                const data = await familyApi.getFamilyGroups()
                this.groups = data
                return data
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async fetchGroupDetail(groupId) {
            const detail = await familyApi.getFamilyGroup(groupId)
            return detail
        },

        async fetchMembers(groupId) {
            this.loading = true
            this.error = null
            try {
                const data = await familyApi.getMembers(groupId)
                this.members = data
                return data
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async createGroup(payload) {
            const data = await familyApi.createFamilyGroup(payload)
            this.groups.push(data)
            return data
        },

        async addMember(groupId, userId, role = 'MEMBER') {
            const data = await familyApi.addMember(groupId, userId, role)
            this.members.push(data)
            return data
        },

        async removeMember(memberId) {
            await familyApi.removeMember(memberId)
            this.members = this.members.filter(m => m.memberId !== memberId)
        },
    },
})
