import { defineStore } from 'pinia'
import challengeApi from '../api/challengeApi'

export const useChallengeStore = defineStore('challengeStore', {
    state: () => ({
        challenges: [],
        participants: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchChallenges(params) {
            this.loading = true
            this.error = null
            try {
                const data = await challengeApi.getChallenges(params)
                this.challenges = data
                return data
            } catch (e) {
                this.error = e.message
                throw e
            } finally {
                this.loading = false
            }
        },

        async createChallenge(payload) {
            const data = await challengeApi.createChallenge(payload)
            this.challenges.push(data)
            return data
        },

        async addParticipant(challengeId, userId) {
            const data = await challengeApi.addParticipant(challengeId, userId)
            this.participants.push(data)
            return data
        },

        async fetchParticipants(challengeId) {
            const list = await challengeApi.getParticipants(challengeId)
            this.participants = list || []
            return this.participants
        },

        async removeParticipant(challengeId, userId) {
            await challengeApi.removeParticipant(challengeId, userId)
            this.participants = this.participants.filter(
                p => !(p.challengeId === challengeId && p.userId === userId)
            )
        },

        async updateParticipantStatus(challengeId, userId, status) {
            const updated = await challengeApi.updateParticipantStatus(challengeId, userId, status)
            // 简单更新本地状态：按 userId 替换
            const idx = this.participants.findIndex(
                p => p.challengeId === challengeId && p.userId === userId
            )
            if (idx !== -1) {
                this.participants[idx] = updated
            }
            return updated
        },
    },
})