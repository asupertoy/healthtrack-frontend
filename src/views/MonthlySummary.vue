<template>
  <div>
    <h2>Monthly Summary</h2>
    <div>
      <label>Year:</label>
      <input type="number" v-model="year" />
      <label>Month:</label>
      <input type="number" v-model="month" />
      <button @click="fetchSummary">Fetch</button>
    </div>
    <div v-if="summary">
      <p>Total Appointments: {{ summary.totalAppointments }}</p>
      <p>Average Weight: {{ summary.avgWeight }}</p>
      <p>Average Blood Pressure: {{ summary.avgBP }}</p>
      <p>Most Popular Challenge: {{ summary.topChallenge }}</p>
      <p>Most Active User: {{ summary.activeUser }}</p>
    </div>
  </div>
</template>

<script>
import { useHealthStore } from '../stores/healthStore'
export default {
  setup() {
    const healthStore = useHealthStore()
    const year = ref(new Date().getFullYear())
    const month = ref(new Date().getMonth() + 1)
    const summary = ref(null)
    const fetchSummary = async () => {
      summary.value = await healthStore.fetchMonthlySummary(year.value, month.value)
    }
    onMounted(fetchSummary)
    return { year, month, summary, fetchSummary }
  }
}
</script>
