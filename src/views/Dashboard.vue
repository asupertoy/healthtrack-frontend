<template>
  <div class="dashboard">
    <h2 class="title">概览</h2>
    <div class="grid">
      <el-card class="stat" shadow="never">
        <div class="label">当前用户</div>
        <div class="value">{{ currentUser?.name || '未登录' }}</div>
      </el-card>
      <el-card class="stat" shadow="never">
        <div class="label">最活跃用户</div>
        <div class="value">{{ mostActiveUser?.name || '-' }}</div>
      </el-card>
      <el-card class="stat" shadow="never">
        <div class="label">热门挑战</div>
        <div class="value">{{ topChallenge?.title || '-' }}</div>
      </el-card>
      <el-card class="stat" shadow="never">
        <div class="label">本月预约数</div>
        <div class="value">{{ monthlySummary?.totalAppointments || 0 }}</div>
      </el-card>
    </div>
    <div class="actions">
      <el-button type="primary" :loading="loading" @click="refresh">刷新概览</el-button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import healthApi from '../api/healthApi'
import { useHealthStore } from '../stores/healthStore'
export default {
  name: 'Dashboard',
  setup(){
    const userStore = useUserStore()
    const healthStore = useHealthStore()
    const mostActiveUser = ref(null)
    const topChallenge = ref(null)
    const monthlySummary = ref(null)
    const loading = ref(false)
    const now = new Date()
    const refresh = async () => {
      loading.value=true
      try {
        try { mostActiveUser.value = await healthApi.getMostActiveUser() } catch(e){}
        try { topChallenge.value = await healthApi.getTopChallenge() } catch(e){}
        if(userStore.user?.userId){
          monthlySummary.value = await healthStore.fetchMonthlySummary(userStore.user.userId, now.getFullYear(), now.getMonth()+1)
        }
      } finally { loading.value=false }
    }
    refresh()
    return { currentUser:userStore.user, mostActiveUser, topChallenge, monthlySummary, loading, refresh }
  }
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
