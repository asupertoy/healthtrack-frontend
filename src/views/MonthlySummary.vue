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
    <SectionCard v-if="healthStore.monthlySummary" title="统计概览">
      <div class="cards">
        <el-card class="metric" shadow="never">
          <div class="label">总预约次数</div>
          <div class="value">{{ healthStore.monthlySummary.totalAppointments || 0 }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">平均体重</div>
          <div class="value">{{ healthStore.monthlySummary.avgWeight || '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">平均血压</div>
          <div class="value">{{ healthStore.monthlySummary.avgBP || '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">最热挑战</div>
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
import SectionCard from '../components/SectionCard.vue'
export default {
  components:{ SectionCard },
  setup() {
    const healthStore = useHealthStore()
    const userStore = useUserStore()
    const year = ref(new Date().getFullYear())
    const month = ref(new Date().getMonth()+1)
    const loading = ref(false)
    const regenerating = ref(false)
    const getUserId = () => userStore.user?.userId || 1
    const fetchSummary = async () => { loading.value=true; try { await healthStore.fetchMonthlySummary(getUserId(), year.value, month.value) } finally { loading.value=false } }
    const regenerate = async () => { regenerating.value=true; try { await healthStore.generateMonthlySummary(getUserId(), year.value, month.value); await fetchSummary() } finally { regenerating.value=false } }
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
