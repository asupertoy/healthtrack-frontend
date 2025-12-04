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

    <!-- 健康榜单 -->
    <div class="leaderboard">
      <h3 class="subtitle">健康榜单</h3>
      <div class="grid">
        <el-card class="stat" shadow="never">
          <div class="label">参与人数最多的健康挑战</div>
          <div class="value">{{ topChallengeTitle }}</div>
          <div class="extra" v-if="topChallengeParticipants !== null">
            参与人数：{{ topChallengeParticipants }}
          </div>
        </el-card>
        <el-card class="stat" shadow="never">
          <div class="label">最活跃用户</div>
          <div class="value">{{ mostActiveUserName }}</div>
          <div class="extra" v-if="mostActiveUserMetric !== null">
            健康记录数：{{ mostActiveUserMetric }}
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useHealthStore } from '../stores/healthStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import { useChallengeStore } from '../stores/challengeStore'
import healthApi from '../api/healthApi'

export default {
  name: 'Dashboard',
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
          // 拉取健康记录和月度汇总
          await Promise.all([
            healthStore.fetchHealthRecords(userId),
            healthStore.fetchMonthlySummaries(userId),
            appointmentStore.fetchAppointments(),
            // 拉取挑战和统计（挑战 store 内部可按当前用户过滤）
            challengeStore.fetchChallenges?.(),
            // 从后端健康记录排行榜中获取最活跃用户（按记录数）
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

    // 参与人数最多的健康挑战：基于 challengeStore.stats 或挑战列表 + 参与者数量
    const topChallengeTitle = computed(() => {
      const stats = challengeStore.challengeStats || []
      if (stats.length) {
        const top = [...stats].sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))[0]
        return top?.title || '暂无数据'
      }
      // 如果没有 stats，就简单用挑战列表长度判断
      const list = challengeStore.challenges || []
      return list.length ? (list[0].title || '未知挑战') : '暂无数据'
    })

    const topChallengeParticipants = computed(() => {
      const stats = challengeStore.challengeStats || []
      if (!stats.length) return null
      const top = [...stats].sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))[0]
      return top?.participantCount ?? null
    })

    // 最活跃用户：根据后端健康记录排行榜（按记录数排序）
    const mostActiveUserName = computed(() => {
      if (!leaderboardTopUser.value) return '暂无数据'
      return leaderboardTopUser.value.name || leaderboardTopUser.value.userName || '未知用户'
    })

    const mostActiveUserMetric = computed(() => {
      if (!leaderboardTopUser.value) return null
      return leaderboardTopUser.value.recordCount ?? null
    })

    refresh()

    return {
      currentUser,
      currentMonthAppointments,
      healthRecordCount,
      monthlySummaryCount,
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
.dashboard { display:flex; flex-direction:column; gap:18px; }
.title { margin:0; font-size:20px; font-weight:600; }
.grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
.stat { text-align:center; }
.stat .label { font-size:12px; color:#666; margin-bottom:6px; }
.stat .value { font-size:22px; font-weight:600; }
.stat .extra { font-size:12px; color:#999; margin-top:4px; }
.actions { display:flex; }
.leaderboard { margin-top:16px; }
.subtitle { margin:0 0 8px; font-size:16px; font-weight:500; }
</style>
