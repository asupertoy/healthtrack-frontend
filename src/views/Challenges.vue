<template>
  <div>
    <el-page-header content="健康挑战" />
    <SectionCard title="创建挑战">
      <el-form :model="challengeForm" label-width="100px" ref="challengeFormRef" :rules="rules" class="challenge-form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="challengeForm.title" placeholder="例如：月行走100公里" />
        </el-form-item>
        <el-form-item label="目标描述" prop="goal">
          <el-input v-model="challengeForm.goal" type="textarea" :rows="2" placeholder="挑战目标说明" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="challengeForm.startDate" type="date" placeholder="开始日期" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="challengeForm.endDate" type="date" placeholder="结束日期" />
        </el-form-item>
        <el-form-item label="邀请联系方式">
          <el-select v-model="challengeForm.invites" multiple filterable allow-create default-first-option placeholder="输入邮箱或电话并回车" style="width:100%">
            <el-option v-for="i in challengeForm.invites" :key="i" :label="i" :value="i" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="creating" @click="createChallenge">创建挑战</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </SectionCard>

    <!-- 已参加的挑战列表 -->
    <SectionCard title="已参加的挑战">
      <el-button type="primary" @click="refresh" :loading="loading" style="margin-bottom:10px">刷新</el-button>
      <el-table :data="joinedChallenges" v-loading="loading" size="small" empty-text="暂无已参加的挑战">
        <el-table-column type="index" width="50" />
        <el-table-column prop="challengeId" label="Challenge ID" width="90" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="goalDescription" label="目标描述" />
        <el-table-column label="开始" width="120">
          <template #default="{ row }">{{ formatDate(row.startDate) }}</template>
        </el-table-column>
        <el-table-column label="结束" width="120">
          <template #default="{ row }">{{ formatDate(row.endDate) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">
            {{ participantCount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="完成人数" width="100">
          <template #default="{ row }">
            {{ completedCount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              size="small"
              type="danger"
              @click="confirmLeave(row)"
            >退出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <!-- 未参加的挑战列表 -->
    <SectionCard title="未参加的挑战">
      <el-table :data="notJoinedChallenges" v-loading="loading" size="small" empty-text="暂无未参加的挑战">
        <el-table-column type="index" width="50" />
        <el-table-column prop="challengeId" label="Challenge ID" width="90" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="goalDescription" label="目标描述" />
        <el-table-column label="开始" width="120">
          <template #default="{ row }">{{ formatDate(row.startDate) }}</template>
        </el-table-column>
        <el-table-column label="结束" width="120">
          <template #default="{ row }">{{ formatDate(row.endDate) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">
            {{ participantCount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="完成人数" width="100">
          <template #default="{ row }">
            {{ completedCount(row) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              size="small"
              type="success"
              @click="confirmJoin(row)"
              :disabled="!userStore.user"
            >加入</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="participantsDialog" title="参与者" width="600px">
      <div class="join-box" v-if="currentChallenge">
        <el-input v-model="joinUserId" placeholder="用户ID" style="max-width:160px" />
        <el-button size="small" type="primary" :disabled="!joinUserId" @click="join">加入挑战</el-button>
      </div>
      <el-table :data="participants" size="small" empty-text="暂无参与者" style="margin-top:10px">
        <el-table-column prop="userName" label="用户" />
        <el-table-column label="进度">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :status="(row.progress||0)===100 ? 'success': undefined" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="leave(row)">退出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import SectionCard from '../components/SectionCard.vue'
import { useChallengeStore } from '../stores/challengeStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useUserStore } from '../stores/userStore'
import { formatDate, formatDateTime } from '../utils/dateUtils'

export default {
  components:{ SectionCard },
  setup() {
    const challengeStore = useChallengeStore()
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const loading = ref(false)
    const creating = ref(false)
    const challengeFormRef = ref(null)
    const challengeForm = reactive({ title:'', goal:'', startDate:'', endDate:'', invites:[] })
    const rules = {
      title:[{ required:true, message:'必填', trigger:'blur' }],
      goal:[{ required:true, message:'必填', trigger:'blur' }],
      startDate:[{ required:true, message:'选择开始日期', trigger:'change' }],
      endDate:[{ required:true, message:'选择结束日期', trigger:'change' }]
    }

    const currentUserId = computed(() => {
      const id = userStore.user?.userId || localStorage.getItem('userId')
      return id ? Number(id) : null
    })

    const refresh = async () => {
      loading.value = true
      try {
        const uid = currentUserId.value
        if (!uid) {
          challengeStore.joinedChallenges = []
          challengeStore.notJoinedChallenges = []
          return
        }
        await Promise.all([
          challengeStore.fetchJoinedChallengesByUser(uid),
          challengeStore.fetchNotJoinedChallengesByUser(uid),
        ])
        try { await challengeStore.fetchAndMergeStats() } catch (e) {/* 非致命 */}
      } finally {
        loading.value = false
      }
    }

    const reset = () => {
      challengeForm.title=''; challengeForm.goal=''; challengeForm.startDate=''; challengeForm.endDate=''; challengeForm.invites=[]
    }

    const createChallenge = () => {
      challengeFormRef.value.validate(async valid => {
        if (!valid) return
        creating.value = true
        try {
          const payload = {
            title: challengeForm.title,
            goalDescription: challengeForm.goal,
            startDate: challengeForm.startDate,
            endDate: challengeForm.endDate,
            description: challengeForm.description || ''
          }
          await challengeStore.createChallenge(payload)
          ns.push('success','挑战创建成功')
          reset()
          await refresh()
        } finally {
          creating.value = false
        }
      })
    }

    const participantCount = row => row.participantCount ?? 0
    const completedCount = row => row.completedCount ?? 0

    const joinedChallenges = computed(() => challengeStore.joinedChallenges || [])
    const notJoinedChallenges = computed(() => challengeStore.notJoinedChallenges || [])

    const confirmJoin = row => {
      if (!currentUserId.value) {
        ns.push('error','未登录，无法加入挑战')
        return
      }
      ElMessageBox.confirm(`确认加入挑战「${row.title}」吗？`, '确认加入', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => joinChallengeRow(row)).catch(() => {})
    }

    const confirmLeave = row => {
      if (!currentUserId.value) {
        ns.push('error','未登录，无法退出挑战')
        return
      }
      ElMessageBox.confirm(`确认退出挑战「${row.title}」吗？`, '确认退出', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => leaveChallengeRow(row)).catch(() => {})
    }

    const joinChallengeRow = async row => {
      const uid = currentUserId.value
      if (!uid) return
      try {
        await challengeStore.addParticipant(row.challengeId, uid)
        ns.push('success','已加入挑战')
        await refresh()
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '加入失败')
      }
    }

    const leaveChallengeRow = async row => {
      const uid = currentUserId.value
      if (!uid) return
      try {
        await challengeStore.removeParticipant(row.challengeId, uid)
        ns.push('warning','已退出挑战')
        await refresh()
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '退出失败')
      }
    }

    const participantsDialog = ref(false)
    const participants = ref([])
    const currentChallenge = ref(null)
    const joinUserId = ref('')

    const viewParticipants = async row => {
      currentChallenge.value = row
      participantsDialog.value = true
      try {
        participants.value = await challengeStore.fetchParticipants(row.challengeId)
      } catch (e) {
        ns.push('error','加载参与者失败')
      }
    }

    const join = async () => {
      if (!currentChallenge.value || !joinUserId.value) return
      try {
        await challengeStore.joinChallenge(currentChallenge.value.challengeId, Number(joinUserId.value))
        ns.push('success','已加入挑战')
        participants.value = await challengeStore.fetchParticipants(currentChallenge.value.challengeId)
        await refresh()
      } catch (e) {
        ns.push('error','加入失败')
      }
    }

    const leave = async row => {
      if (!row.participationId) return
      try {
        await challengeStore.leaveChallenge(row.participationId)
        ns.push('warning','已退出挑战')
        participants.value = participants.value.filter(p => p.participationId !== row.participationId)
        await refresh()
      } catch (e) {
        ns.push('error','退出失败')
      }
    }

    onMounted(refresh)

    return {
      challengeStore,
      userStore,
      loading,
      creating,
      challengeForm,
      rules,
      challengeFormRef,
      refresh,
      reset,
      createChallenge,
      participantsDialog,
      participants,
      currentChallenge,
      joinUserId,
      viewParticipants,
      join,
      leave,
      formatDate,
      formatDateTime,
      joinedChallenges,
      notJoinedChallenges,
      participantCount,
      completedCount,
      confirmJoin,
      confirmLeave,
    }
  },
}
</script>
<style scoped>
.challenge-form { max-width:620px; }
.join-box { display:flex; gap:10px; align-items:center; margin-bottom:6px; }
</style>
