import { defineStore } from 'pinia'
import challengeApi from '../api/challengeApi'

export const useChallengeStore = defineStore('challengeStore', {
    state: () => ({
        challenges: [],
        participants: [],
        loading: false
    }),

    actions: {
        async loadChallenges() {
            this.loading = true
            try {
                const res = await challengeApi.getChallenges()
                this.challenges = res.data
            } finally {
                this.loading = false
            }
        },

        async createChallenge(data) {
            const res = await challengeApi.createChallenge(data)
            this.challenges.push(res.data)
            return res.data
        },

        async joinChallenge(challengeId, userId) {
            const res = await challengeApi.joinChallenge(challengeId, userId)
            this.participants.push(res.data)
            return res.data
        }
    }
})
