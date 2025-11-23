<template>
  <div>
    <h2>Health Challenges</h2>
    <button @click="fetchChallenges">Refresh</button>
    <ul>
      <li v-for="ch in challenges" :key="ch.id">
        {{ ch.title }} - {{ ch.participants }} participants
      </li>
    </ul>
    <div>
      <h3>Create New Challenge</h3>
      <input v-model="newTitle" placeholder="Challenge Title"/>
      <button @click="createChallenge">Create</button>
    </div>
  </div>
</template>

<script>
import { useChallengeStore } from '../stores/challengeStore'
export default {
  setup() {
    const challengeStore = useChallengeStore()
    const challenges = ref([])
    const newTitle = ref('')
    const fetchChallenges = async () => {
      challenges.value = await challengeStore.fetchChallenges()
    }
    const createChallenge = async () => {
      if(!newTitle.value) return
      await challengeStore.createChallenge({ title: newTitle.value })
      newTitle.value = ''
      fetchChallenges()
    }
    onMounted(fetchChallenges)
    return { challenges, newTitle, fetchChallenges, createChallenge }
  }
}
</script>
