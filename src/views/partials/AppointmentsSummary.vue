<template>
  <SectionCard title="预约摘要" class="appointments-summary">
    <div v-if="loading" class="summary-loading">
      <el-skeleton rows="3" animated />
    </div>
    <div v-else>
      <div v-if="upcomingAppointments.length" class="upcoming-list">
        <div class="upcoming-item" v-for="item in upcomingAppointments" :key="item.appointmentId">
          <div class="item-time">
            <span class="time-label">{{ formatDate(item.scheduledAt) }}</span>
            <span class="time-sub">{{ formatType(item.consultationType) }}</span>
          </div>
          <div class="item-info">
            <p class="doctor">{{ item.providerName || resolveProviderName(item) || '未指定医生' }}</p>
            <p class="memo" v-if="item.memo">{{ item.memo }}</p>
            <el-tag size="small" :type="statusTag(item.status)">{{ item.status || 'SCHEDULED' }}</el-tag>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-empty description="暂无即将到来的预约" />
      </div>
    </div>
  </SectionCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SectionCard from '../../components/SectionCard.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { formatLocalDateTime } from '../../utils/dateUtils'

const appointmentStore = useAppointmentStore()
const ns = useNotificationStore()
const loading = ref(false)

const resolveProviderName = (appointment) => {
  if (!appointment) return ''
  return appointment.provider?.name || appointment.providerName || appointment.providerId || ''
}

const formatDate = (value) => {
  return formatLocalDateTime(value) || '未知时间'
}

const formatType = (type) => {
  if (!type) return ''
  return type === 'VIRTUAL' ? '线上就诊' : '线下就诊'
}

const statusTag = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'SCHEDULED': return 'info'
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'warning'
    case 'NO_SHOW': return 'danger'
    default: return ''
  }
}

const upcomingAppointments = computed(() => {
  const now = new Date()
  return (appointmentStore.appointments || [])
    .filter(a => {
      const scheduled = new Date(a.scheduledAt || a.date || a.createdAt)
      return scheduled >= now
    })
    .sort((a, b) => new Date(a.scheduledAt || a.date || 0) - new Date(b.scheduledAt || b.date || 0))
    .slice(0, 3)
})

onMounted(async () => {
  if (!appointmentStore.appointments.length) {
    loading.value = true
    try {
      await appointmentStore.fetchAppointments()
    } catch (e) {
      ns.push('error', e?.response?.data?.message || e.message || '加载预约摘要失败')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.appointments-summary {
  margin-top: 8px;
}
.summary-loading {
  padding: 10px 0;
}
.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.upcoming-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #eef1f7;
}
.upcoming-item:last-child {
  border-bottom: none;
}
.item-time {
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #606266;
  font-size: 13px;
}
.time-label {
  font-weight: 600;
  color: #303133;
}
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.doctor {
  margin: 0;
  font-weight: 600;
  color: #303133;
}
.memo {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
.empty-state {
  padding: 16px 0;
}
</style>

