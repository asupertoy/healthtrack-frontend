import { defineStore } from 'pinia'
import challengeApi from '../api/challengeApi'

export const useChallengeStore = defineStore('challengeStore', {
    state: () => ({
        // 所有挑战（可选，用于其它视图）
        challenges: [],
        // 当前用户已参加的挑战
        joinedChallenges: [],
        // 当前用户未参加的挑战
        notJoinedChallenges: [],
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
                this.challenges = Array.isArray(data) ? data : []
                return this.challenges
            } catch (e) {
                this.error = e.message
                this.challenges = []
                throw e
            } finally {
                this.loading = false
            }
        },

        async fetchJoinedChallengesByUser(userId) {
            this.loading = true
            this.error = null
            try {
                const data = await challengeApi.getChallengesByUser(userId)
                this.joinedChallenges = Array.isArray(data) ? data : []
                return this.joinedChallenges
            } catch (e) {
                this.error = e.message
                this.joinedChallenges = []
                throw e
            } finally {
                this.loading = false
            }
        },

        async fetchNotJoinedChallengesByUser(userId) {
            this.loading = true
            this.error = null
            try {
                const data = await challengeApi.getNotJoinedChallengesByUser(userId)
                this.notJoinedChallenges = Array.isArray(data) ? data : []
                return this.notJoinedChallenges
            } catch (e) {
                this.error = e.message
                this.notJoinedChallenges = []
                throw e
            } finally {
                this.loading = false
            }
        },

        // 新增：拉取统计并合并到 challenges
        async fetchAndMergeStats() {
            try {
                const stats = await challengeApi.getChallengeStats()
                const map = new Map()
                stats.forEach(s => map.set(s.challengeId, s))
                const mergeList = list => (Array.isArray(list) ? list : []).map(c => ({ ...c, ...map.get(c.challengeId) }))
                this.challenges = mergeList(this.challenges)
                this.joinedChallenges = mergeList(this.joinedChallenges)
                this.notJoinedChallenges = mergeList(this.notJoinedChallenges)
                return stats
            } catch (e) {
                this.error = e.message
                throw e
            }
        },

        async createChallenge(payload) {
            const data = await challengeApi.createChallenge(payload)
            if (Array.isArray(this.challenges)) {
                this.challenges.push(data)
            } else {
                this.challenges = [data]
            }
            return data
        },

        async addParticipant(challengeId, userId) {
            const data = await challengeApi.addParticipant(challengeId, userId)
            this.participants.push(data)
            return data
        },

        async fetchParticipants(challengeId) {
            const list = await challengeApi.getParticipants(challengeId)
            this.participants = Array.isArray(list) ? list : []
            return this.participants
        },

        async removeParticipant(challengeId, userId) {
            await challengeApi.removeParticipant(challengeId, userId)
            this.participants = this.participants.filter(
                p => !(p.challengeId === challengeId && (p.userId === userId || p.participationId && p.participationId === userId))
            )
        },

        async updateParticipantStatus(challengeId, userId, status) {
            const updated = await challengeApi.updateParticipantStatus(challengeId, userId, status)
            const idx = this.participants.findIndex(
                p => p.challengeId === challengeId && p.userId === userId
            )
            if (idx !== -1) {
                this.participants[idx] = updated
            }
            return updated
        },

        async joinChallenge(challengeId, userId) {
            return await this.addParticipant(challengeId, userId)
        },

        async leaveChallenge(participationId) {
            const p = this.participants.find(x => x.participationId === participationId)
            if (p) {
                await this.removeParticipant(p.challengeId, p.userId)
                return
            }
            throw new Error('参与记录未找到，本地无法删除')
        },
    },
})