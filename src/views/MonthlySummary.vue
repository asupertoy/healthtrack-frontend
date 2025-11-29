<template>
  <div>
    <el-page-header content="月度健康摘要" />
    <SectionCard title="查询条件">
      <div class="filters">
        <el-input-number v-model="year" :min="2000" :max="2100" label="年份" />
        <el-input-number v-model="month" :min="1" :max="12" label="月份" />
        <el-button type="primary" :loading="loading" @click="fetchSummary">查询</el-button>
        <el-button @click="regenerate" :loading="regenerating">重新生成</el-button>
      </div>
    </SectionCard>
    <LoadingSpinner :visible="loading" text="加载中..." />
    <SectionCard v-if="healthStore.monthlySummary" title="统计概览">
      <div class="cards">
        <el-card class="metric" shadow="never">
          <div class="label">总预约次数</div>
          <div class="value">{{ healthStore.monthlySummary.totalAppointments || 0 }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">平均体重</div>
          <div class="value">{{ healthStore.monthlySummary.avgWeight ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">最小体重</div>
          <div class="value">{{ healthStore.monthlySummary.minWeight ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">最大体重</div>
          <div class="value">{{ healthStore.monthlySummary.maxWeight ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">平均血压</div>
          <div class="value">{{ healthStore.monthlySummary.avgBP ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">最低血压</div>
          <div class="value">{{ healthStore.monthlySummary.minBP ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">最高血压</div>
          <div class="value">{{ healthStore.monthlySummary.maxBP ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">热门挑战</div>
          <div class="value">{{ healthStore.monthlySummary.topChallenge || '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">最活跃用户</div>
          <div class="value">{{ healthStore.monthlySummary.activeUser || '-' }}</div>
        </el-card>
      </div>
    </SectionCard>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useHealthStore } from '../stores/healthStore'
import { useUserStore } from '../stores/userStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import SectionCard from '../components/SectionCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useNotificationStore } from '../stores/notificationStore'
export default {
  components:{ SectionCard, LoadingSpinner },
  setup() {
    const healthStore = useHealthStore()
    const userStore = useUserStore()
    const appointmentStore = useAppointmentStore()
    const ns = useNotificationStore()
    const year = ref(new Date().getFullYear())
    const month = ref(new Date().getMonth()+1)
    const loading = ref(false)
    const regenerating = ref(false)
    const getUserId = () => userStore.user?.userId || 1
    const enrichSummary = async () => {
      // Fallback: compute total appointments if missing
      if (healthStore.monthlySummary && (healthStore.monthlySummary.totalAppointments == null)) {
        const startDate = `${year.value}-${String(month.value).padStart(2,'0')}-01`
        const endDate = `${year.value}-${String(month.value).padStart(2,'0')}-31`
        try {
          const count = await appointmentStore.countAppointments(getUserId(), startDate, endDate)
          healthStore.monthlySummary.totalAppointments = count
        } catch(e){ /* ignore */ }
      }
    }
    const fetchSummary = async () => { loading.value=true; try { await healthStore.fetchMonthlySummary(getUserId(), year.value, month.value); await enrichSummary() } finally { loading.value=false } }
    const regenerate = async () => { regenerating.value=true; try { await healthStore.generateMonthlySummary(getUserId(), year.value, month.value); ns.push('info','摘要已重新生成'); await fetchSummary() } finally { regenerating.value=false } }
    fetchSummary()
    return { healthStore, year, month, loading, regenerating, fetchSummary, regenerate }
  }
}
</script>

<style scoped>
.filters { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:16px; }
.metric { text-align:center; }
.metric .label { font-size:12px; color:#666; margin-bottom:4px; }
.metric .value { font-size:20px; font-weight:600; }
</style>
