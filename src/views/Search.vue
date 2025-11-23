<template>
  <div>
    <h2>Search Records</h2>
    <form @submit.prevent="search">
      <input v-model="query.userId" placeholder="User ID"/>
      <input v-model="query.provider" placeholder="Provider"/>
      <input type="date" v-model="query.startDate"/>
      <input type="date" v-model="query.endDate"/>
      <button type="submit">Search</button>
    </form>
    <ul>
      <li v-for="rec in results" :key="rec.id">
        {{ rec.userName }} - {{ rec.provider }} - {{ rec.type }} - {{ rec.date }}
      </li>
    </ul>
  </div>
</template>

<script>
import { useHealthStore } from '../stores/healthStore'
export default {
  setup() {
    const healthStore = useHealthStore()
    const query = reactive({ userId:'', provider:'', startDate:'', endDate:'' })
    const results = ref([])
    const search = async () => {
      results.value = await healthStore.searchRecords(query)
    }
    return { query, results, search }
  }
}
</script>
