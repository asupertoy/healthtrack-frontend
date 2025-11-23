<template>
  <div>
    <h2>Appointments</h2>
    <button @click="fetchAppointments">Refresh</button>
    <ul>
      <li v-for="app in appointments" :key="app.id">
        {{ app.date }} - {{ app.providerName }} - {{ app.type }}
      </li>
    </ul>
  </div>
</template>

<script>
import { useAppointmentStore } from '../stores/appointmentStore'
export default {
  setup() {
    const appointmentStore = useAppointmentStore()
    const appointments = ref([])
    const fetchAppointments = async () => {
      appointments.value = await appointmentStore.fetchAppointments()
    }
    onMounted(fetchAppointments)
    return { appointments, fetchAppointments }
  }
}
</script>
