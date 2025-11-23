import { defineStore } from 'pinia'
import challengeApi from '../api/challengeApi'

export const useChallengeStore = defineStore('challengeStore', {
    state: () => ({
        challenges: [],
        participants: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchChallenges() {
            this.loading = true
            this.error = null
            try {
                const data = await challengeApi.getChallenges()
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

        async joinChallenge(challengeId, userId) {
            const data = await challengeApi.joinChallenge(challengeId, userId)
            this.participants.push(data)
            return data
        },

        async fetchParticipants(challengeId) {
            const detail = await challengeApi.getChallengeDetail(challengeId)
            this.participants = detail.participants || []
            return this.participants
        }
    }
})
