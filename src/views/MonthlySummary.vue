<template>
  <div>
    <el-page-header content="月度健康摘要" />
    <SectionCard title="查询条件">
      <div class="filters">
        <el-input-number v-model="year" :min="2000" :max="2100" label="年份" />
        <el-input-number v-model="month" :min="1" :max="12" label="月份" />
        <el-button type="primary" :loading="loading" @click="fetchSummary">查询</el-button>
      </div>
    </SectionCard>
    <LoadingSpinner :visible="loading" text="加载中..." />
    <SectionCard v-if="currentSummary" title="统计概览">
      <div class="cards">
        <el-card class="metric" shadow="never">
          <div class="label">健康记录条数</div>
          <div class="value">{{ currentSummary.recordCount }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">体重平均值</div>
          <div class="value">{{ currentSummary.weight.avg ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">体重最小值</div>
          <div class="value">{{ currentSummary.weight.min ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">体重最大值</div>
          <div class="value">{{ currentSummary.weight.max ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">血压平均值</div>
          <div class="value">{{ currentSummary.bp.avg ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">血压最小值</div>
          <div class="value">{{ currentSummary.bp.min ?? '-' }}</div>
        </el-card>
        <el-card class="metric" shadow="never">
          <div class="label">血压最大值</div>
          <div class="value">{{ currentSummary.bp.max ?? '-' }}</div>
        </el-card>
      </div>
    </SectionCard>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useHealthStore } from '../stores/healthStore'
import { useUserStore } from '../stores/userStore'
import SectionCard from '../components/SectionCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { useNotificationStore } from '../stores/notificationStore'

export default {
  components: { SectionCard, LoadingSpinner },
  setup() {
    const healthStore = useHealthStore()
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const year = ref(new Date().getFullYear())
    const month = ref(new Date().getMonth() + 1)
    const loading = ref(false)

    const getUserId = () => userStore.user?.userId || userStore.userId || 1

    // 只按月从健康记录中做聚合统计
    const fetchSummary = async () => {
      loading.value = true
      try {
        const userId = getUserId()
        await healthStore.fetchHealthRecords(userId)
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '加载月度摘要失败')
      } finally {
        loading.value = false
      }
    }

    const currentSummary = computed(() => {
      const records = healthStore.healthRecords || []
      if (!records.length) return null
      const ym = `${year.value}-${String(month.value).padStart(2, '0')}`
      const monthRecords = records.filter(r => (r.recordDate || '').startsWith(ym))
      if (!monthRecords.length) return null

      // 体重统计
      const weightValues = monthRecords
        .filter(r => r.metricType === 'weight')
        .map(r => Number(r.metricValue))
        .filter(v => !Number.isNaN(v))

      // 血压统计（假定 metricType 为 'blood_pressure'，值可为单个数值或 "120/80" 形式，这里先按数值处理简化）
      const bpValues = monthRecords
        .filter(r => r.metricType === 'blood_pressure')
        .map(r => {
          if (typeof r.metricValue === 'string' && r.metricValue.includes('/')) {
            const [systolic] = r.metricValue.split('/')
            return Number(systolic)
          }
          return Number(r.metricValue)
        })
        .filter(v => !Number.isNaN(v))

      const aggregate = values => {
        if (!values.length) return { avg: null, min: null, max: null }
        const sum = values.reduce((a, b) => a + b, 0)
        return {
          avg: (sum / values.length).toFixed(1),
          min: Math.min(...values),
          max: Math.max(...values),
        }
      }

      return {
        recordCount: monthRecords.length,
        weight: aggregate(weightValues),
        bp: aggregate(bpValues),
      }
    })

    fetchSummary()

    return { healthStore, year, month, loading, fetchSummary, currentSummary }
  },
}
</script>

<style scoped>
.filters { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
.cards { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap:16px; }
.metric { text-align:center; }
.metric .label { font-size:12px; color:#666; margin-bottom:4px; }
.metric .value { font-size:20px; font-weight:600; }
</style>
