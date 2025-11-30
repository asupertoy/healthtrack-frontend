<template>
  <div class="dashboard">
    <h2 class="title">概览</h2>
    <div class="grid">
      <el-card class="stat" shadow="never">
        <div class="label">当前用户</div>
        <div class="value">{{ currentUser?.name || '未登录' }}</div>
      </el-card>
      <el-card class="stat" shadow="never">
        <div class="label">本月预约数</div>
        <div class="value">{{ currentMonthAppointments }}</div>
      </el-card>
      <el-card class="stat" shadow="never">
        <div class="label">健康记录条数</div>
        <div class="value">{{ healthRecordCount }}</div>
      </el-card>
      <el-card class="stat" shadow="never">
        <div class="label">月度汇总条数</div>
        <div class="value">{{ monthlySummaryCount }}</div>
      </el-card>
    </div>
    <div class="actions">
      <el-button type="primary" :loading="loading" @click="refresh">刷新概览</el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useHealthStore } from '../stores/healthStore'
import { useAppointmentStore } from '../stores/appointmentStore'

export default {
  name: 'Dashboard',
  setup() {
    const userStore = useUserStore()
    const healthStore = useHealthStore()
    const appointmentStore = useAppointmentStore()
    const loading = ref(false)
    const now = new Date()

    const refresh = async () => {
      loading.value = true
      try {
        const userId = userStore.user?.userId || userStore.userId
        if (userId) {
          // 拉取健康记录和月度汇总
          await Promise.all([
            healthStore.fetchHealthRecords(userId),
            healthStore.fetchMonthlySummaries(userId),
            appointmentStore.fetchAppointments(),
          ])
        }
      } finally {
        loading.value = false
      }
    }

    const currentUser = computed(() => userStore.user)

    const currentMonthAppointments = computed(() => {
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const list = appointmentStore.appointments || []
      return list.filter(a => {
        const d = new Date(a.scheduledAt || a.date || a.createdAt)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      }).length
    })

    const healthRecordCount = computed(() => healthStore.healthRecords.length)
    const monthlySummaryCount = computed(() => healthStore.monthlySummaries.length)

    refresh()

    return {
      currentUser,
      currentMonthAppointments,
      healthRecordCount,
      monthlySummaryCount,
      loading,
      refresh,
    }
  },
}
</script>

<style scoped>
.dashboard { display:flex; flex-direction:column; gap:18px; }
.title { margin:0; font-size:20px; font-weight:600; }
.grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
.stat { text-align:center; }
.stat .label { font-size:12px; color:#666; margin-bottom:6px; }
.stat .value { font-size:22px; font-weight:600; }
.actions { display:flex; }
</style>
