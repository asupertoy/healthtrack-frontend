import { defineStore } from 'pinia'
import familyApi from '../api/familyApi'

export const useFamilyStore = defineStore('familyStore', {
    state: () => ({
        groups: [],
        members: [],
        loading: false
    }),

    actions: {
        async loadGroups(userId) {
            const res = await familyApi.getGroups(userId)
            this.groups = res.data
        },

        async loadMembers(groupId) {
            const res = await familyApi.getMembers(groupId)
            this.members = res.data
        },

        async createGroup(data) {
            const res = await familyApi.createGroup(data)
            this.groups.push(res.data)
            return res.data
        },

        async addMember(groupId, userId) {
            const res = await familyApi.addMember(groupId, userId)
            this.members.push(res.data)
            return res.data
        },

        async removeMember(memberId) {
            await familyApi.removeMember(memberId)
            this.members = this.members.filter(m => m.memberId !== memberId)
        }
    }
})
jxu