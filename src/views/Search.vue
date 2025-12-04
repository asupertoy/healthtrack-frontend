<template>
  <div>
    <el-page-header content="记录搜索" />
    <el-tabs v-model="active" class="search-tabs">
      <el-tab-pane label="预约搜索" name="appointments">
        <SectionCard title="预约过滤条件">
          <el-form :model="appointmentQuery" label-width="100px" class="filter-form">
            <el-form-item label="用户ID" required>
              <el-input v-model="appointmentQuery.userId" placeholder="必填：预约用户ID" />
            </el-form-item>
            <el-form-item label="医生ID" required>
              <el-input v-model="appointmentQuery.providerId" placeholder="必填：医生/提供者ID" />
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="appointmentQuery.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始日期"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="appointmentQuery.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结束日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="searchingAppointments" @click="searchAppointments">搜索</el-button>
              <el-button @click="resetAppointments">重置</el-button>
            </el-form-item>
          </el-form>
        </SectionCard>
        <SectionCard title="预约记录结果">
          <el-table :data="formattedAppointmentResults" size="small" empty-text="暂无数据" v-loading="searchingAppointments">
            <!-- 医生姓名（基于 providerName 或 provider?.name） -->
            <el-table-column label="医生姓名" min-width="140">
              <template #default="{ row }">
                {{ row.providerName || row.provider?.name || row.providerId || '-' }}
              </template>
            </el-table-column>
            <!-- 预约时间（scheduledAt） -->
            <el-table-column prop="scheduledAtDisplay" label="预约时间" min-width="160" />
            <!-- 类型：线上/线下 -->
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                {{ row.consultationType === 'VIRTUAL' ? '线上' : row.consultationType === 'IN_PERSON' ? '线下' : (row.type || '-') }}
              </template>
            </el-table-column>
            <!-- 备注 -->
            <el-table-column prop="memo" label="备注" min-width="160" />
            <!-- 预约状态 -->
            <el-table-column prop="status" label="状态" width="100" />
            <!-- 创建时间 -->
            <el-table-column prop="createdAtDisplay" label="创建时间" min-width="160" />
          </el-table>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="健康记录搜索" name="records">
        <SectionCard title="健康记录过滤条件">
          <el-form :model="recordQuery" label-width="100px" class="filter-form">
            <el-form-item label="用户ID" required>
              <el-input v-model="recordQuery.userId" placeholder="必填：用户ID" />
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker
                v-model="recordQuery.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择开始日期"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="recordQuery.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择结束日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="searchingRecords" @click="searchRecords">搜索</el-button>
              <el-button @click="resetRecords">重置</el-button>
            </el-form-item>
          </el-form>
        </SectionCard>
        <SectionCard title="健康记录结果">
          <el-table :data="formattedRecordResults" size="small" empty-text="暂无数据" v-loading="searchingRecords">
            <el-table-column prop="recordDate" label="日期" min-width="120" />
            <el-table-column prop="metricType" label="类型" min-width="120" />
            <el-table-column label="数值" min-width="140">
              <template #default="{ row }">
                {{ formatRecordMetricValue(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="metricUnit" label="单位" width="100" />
          </el-table>
        </SectionCard>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useHealthStore } from '../stores/healthStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import SectionCard from '../components/SectionCard.vue'
import { useNotificationStore } from '../stores/notificationStore'
import appointmentApi from '../api/appointmentApi'
import healthApi from '../api/healthApi'

export default {
  components: { SectionCard },
  setup() {
    const healthStore = useHealthStore()
    const appointmentStore = useAppointmentStore()
    const ns = useNotificationStore()
    const active = ref('appointments')
    const appointmentQuery = reactive({ userId: '', providerId: '', startDate: '', endDate: '' })
    const recordQuery = reactive({ userId: '', startDate: '', endDate: '' })
    const appointmentResults = ref([])
    const recordResults = ref([])
    const searchingAppointments = ref(false)
    const searchingRecords = ref(false)

    const searchAppointments = async () => {
      // 用户和医生ID必填校验
      if (!appointmentQuery.userId || !appointmentQuery.providerId) {
        ns.push('warning', '预约搜索：请先填写【用户ID】和【医生ID】')
        return
      }
      searchingAppointments.value = true
      try {
        const data = await appointmentApi.searchAppointments(appointmentQuery)
        appointmentResults.value = data || []
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '预约搜索失败')
      } finally {
        searchingAppointments.value = false
      }
    }

    const searchRecords = async () => {
      // 用户ID必填校验
      if (!recordQuery.userId) {
        recordResults.value = []
        ns.push('warning', '健康记录搜索：请先填写【用户ID】')
        return
      }
      searchingRecords.value = true
      try {
        const data = await healthApi.searchHealthRecords(recordQuery)
        recordResults.value = data || []
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '健康记录搜索失败')
      } finally {
        searchingRecords.value = false
      }
    }

    const resetAppointments = () => {
      appointmentQuery.userId = ''
      appointmentQuery.providerId = ''
      appointmentQuery.startDate = ''
      appointmentQuery.endDate = ''
      appointmentResults.value = []
    }

    const resetRecords = () => {
      recordQuery.userId = ''
      recordQuery.startDate = ''
      recordQuery.endDate = ''
      recordResults.value = []
    }

    // 将 scheduledAt / createdAt 中的 T 替换为空格，仅用于展示
    const formattedAppointmentResults = computed(() => {
      return (appointmentResults.value || []).map(a => {
        const scheduled = a.scheduledAt || a.date || ''
        const created = a.createdAt || ''
        return {
          ...a,
          scheduledAtDisplay: typeof scheduled === 'string' ? scheduled.replace('T', ' ') : scheduled,
          createdAtDisplay: typeof created === 'string' ? created.replace('T', ' ') : created,
        }
      })
    })

    // 健康记录搜索结果格式化：直接使用后端返回的 recordDate/metricType/metricValue/metricUnit，
    // 如有需要可以在此处补充 userName（例如从用户缓存中映射）。
    const formattedRecordResults = computed(() => {
      return (recordResults.value || []).map(r => ({
        ...r,
        // 确保字段名统一
        recordDate: r.recordDate || r.date || '',
      }))
    })

    // 复用 HealthRecords.vue 中的血压展示逻辑
    const formatRecordMetricValue = (row) => {
      if (!row) return ''
      const type = row.metricType
      const val = row.metricValue
      const mjson = row.metricJson || row.metric_json || row.metricJSON || null
      if (type === 'blood_pressure') {
        // 先看值中是否是 "120/80" 形式
        if (typeof val === 'string' && val.includes('/')) {
          const parts = val.split('/').map(p => p.trim()).filter(Boolean)
          if (parts.length === 2) return `${parts[0]}/${parts[1]}`
        }
        if (val === null || val === undefined || val === '') {
          if (!mjson) return ''
          let obj = mjson
          if (typeof mjson === 'string') {
            try { obj = JSON.parse(mjson) } catch (e) { return mjson }
          }
          const s = obj.systolic ?? obj.systolicPressure ?? obj.s ?? obj.sys ?? null
          const d = obj.diastolic ?? obj.diastolicPressure ?? obj.d ?? obj.dia ?? null
          if (s != null && d != null) return `${s}/${d}`
          try { return JSON.stringify(obj) } catch (e) { return String(obj) }
        }
        return val == null ? '' : String(val)
      }
      return val == null ? '' : String(val)
    }

    return {
      active,
      appointmentQuery,
      recordQuery,
      appointmentResults,
      recordResults,
      searchingAppointments,
      searchingRecords,
      searchAppointments,
      searchRecords,
      resetAppointments,
      resetRecords,
      formattedAppointmentResults,
      formattedRecordResults,
      formatRecordMetricValue,
    }
  },
}
</script>

<style scoped>
.search-tabs { margin-top:10px; }
.filter-form { max-width:780px; }
</style>
