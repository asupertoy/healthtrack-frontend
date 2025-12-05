<template>
  <div class="dashboard">
    <div class="header-row">
      <div>
        <h2 class="title">概览</h2>
        <p class="subtitle">快速了解你的健康和预约走势</p>
      </div>
      <el-button type="primary" :loading="loading" @click="refresh">刷新概览</el-button>
    </div>

    <div class="grid">
      <div class="stat" v-for="item in stats" :key="item.label">
        <div class="stat-icon" :style="{ background: item.gradient }">
          <span>{{ item.icon }}</span>
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ item.label }}</p>
          <p class="stat-value">{{ item.value }}</p>
        </div>
      </div>
    </div>

    <!-- 健康榜单 -->
    <SectionCard title="健康榜单">
      <div class="leaderboard-grid">
        <div class="leader-card">
          <p class="leader-label">参与人数最多的健康挑战</p>
          <p class="leader-value">{{ topChallengeTitle }}</p>
          <p class="leader-extra" v-if="topChallengeParticipants !== null">
            参与人数：{{ topChallengeParticipants }}
          </p>
        </div>
        <div class="leader-card">
          <p class="leader-label">最活跃用户</p>
          <p class="leader-value">{{ mostActiveUserName }}</p>
          <p class="leader-extra" v-if="mostActiveUserMetric !== null">
            健康记录数：{{ mostActiveUserMetric }}
          </p>
        </div>
      </div>
    </SectionCard>

    <!-- 预约摘要 -->
    <AppointmentsSummary v-if="currentUser" />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useHealthStore } from '../stores/healthStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import { useChallengeStore } from '../stores/challengeStore'
import healthApi from '../api/healthApi'
import SectionCard from '../components/SectionCard.vue'
import AppointmentsSummary from './partials/AppointmentsSummary.vue'

export default {
  name: 'Dashboard',
  components: { SectionCard, AppointmentsSummary },
  setup() {
    const userStore = useUserStore()
    const healthStore = useHealthStore()
    const appointmentStore = useAppointmentStore()
    const challengeStore = useChallengeStore()
    const loading = ref(false)
    const now = new Date()

    const leaderboardTopUser = ref(null)

    const refresh = async () => {
      loading.value = true
      try {
        const userId = userStore.user?.userId || userStore.userId
        if (userId) {
          await Promise.all([
            healthStore.fetchHealthRecords(userId),
            healthStore.fetchMonthlySummaries(userId),
            appointmentStore.fetchAppointments(),
            challengeStore.fetchChallenges?.(),
            healthApi.getHealthRecordLeaderboard(1).then(list => {
              leaderboardTopUser.value = (list && list.length) ? list[0] : null
            }),
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

    const topChallengeTitle = computed(() => {
      const stats = challengeStore.challengeStats || []
      if (stats.length) {
        const top = [...stats].sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))[0]
        return top?.title || '暂无数据'
      }
      const list = challengeStore.challenges || []
      return list.length ? (list[0].title || '未知挑战') : '暂无数据'
    })

    const topChallengeParticipants = computed(() => {
      const stats = challengeStore.challengeStats || []
      if (!stats.length) return null
      const top = [...stats].sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))[0]
      return top?.participantCount ?? null
    })

    const mostActiveUserName = computed(() => {
      if (!leaderboardTopUser.value) return '暂无数据'
      return leaderboardTopUser.value.name || leaderboardTopUser.value.userName || '未知用户'
    })

    const mostActiveUserMetric = computed(() => {
      if (!leaderboardTopUser.value) return null
      return leaderboardTopUser.value.recordCount ?? null
    })

    const stats = computed(() => [
      {
        label: '当前用户',
        value: currentUser.value?.name || '未登录',
        icon: '👤',
        gradient: 'linear-gradient(135deg, #ffd9eb, #ff8fcf)'
      },
      {
        label: '本月预约数',
        value: currentMonthAppointments.value,
        icon: '📅',
        gradient: 'linear-gradient(135deg, #d9f6ff, #87d8ff)'
      },
      {
        label: '健康记录条数',
        value: healthRecordCount.value,
        icon: '📋',
        gradient: 'linear-gradient(135deg, #e9f7df, #9de27a)'
      },
      {
        label: '月度汇总条数',
        value: monthlySummaryCount.value,
        icon: '📊',
        gradient: 'linear-gradient(135deg, #f9e4c8, #f5c676)'
      }
    ])

    refresh()

    return {
      stats,
      topChallengeTitle,
      topChallengeParticipants,
      mostActiveUserName,
      mostActiveUserMetric,
      loading,
      refresh,
    }
  },
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.subtitle {
  margin: 4px 0 0;
  color: #909399;
  font-size: 13px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px;
}
.stat {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(15, 41, 80, 0.06);
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  margin-right: 14px;
  color: #fff;
}
.stat-label {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
.stat-value {
  margin: 4px 0 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}
.leaderboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.leader-card {
  padding: 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fbff, #eef4ff);
  border: 1px solid #e0e7ff;
}
.leader-label {
  margin: 0;
  font-size: 13px;
  color: #909399;
}
.leader-value {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}
.leader-extra {
  margin: 6px 0 0;
  font-size: 12px;
  color: #606266;
}
@media (max-width: 600px) {
  .header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
