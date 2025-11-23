<template>
  <div>
    <el-page-header content="健康挑战" />
    <SectionCard title="创建挑战">
      <el-form :model="challengeForm" label-width="100px" ref="challengeFormRef" :rules="rules">
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
    <SectionCard title="挑战列表">
      <el-button type="primary" @click="refresh" :loading="loading" style="margin-bottom:10px">刷新</el-button>
      <el-table :data="challengeStore.challenges" v-loading="loading" size="small" empty-text="暂无挑战">
        <el-table-column type="index" width="50" />
        <el-table-column prop="challengeId" label="ID" width="90" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="goal" label="目标" />
        <el-table-column label="参与人数" width="100">
          <template #default="{ row }">{{ row.participantCount || row.participants?.length || 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button size="small" @click="viewParticipants(row)">参与者</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="participantsDialog" title="参与者" width="500px">
      <el-table :data="participants" size="small" empty-text="暂无参与者">
        <el-table-column prop="userName" label="用户" />
        <el-table-column prop="progress" label="进度" />
      </el-table>
      <template #footer>
        <el-button @click="participantsDialog=false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue'
import { useChallengeStore } from '../stores/challengeStore'
import SectionCard from '../components/SectionCard.vue'
export default {
  components:{ SectionCard },
  setup() {
    const challengeStore = useChallengeStore()
    const loading = ref(false)
    const creating = ref(false)
    const challengeFormRef = ref(null)
    const challengeForm = reactive({ title:'', goal:'', startDate:'', endDate:'', invites:[] })
    const rules = { title:[{required:true,message:'必填',trigger:'blur'}], startDate:[{required:true,message:'必填',trigger:'change'}], endDate:[{required:true,message:'必填',trigger:'change'}] }
    const refresh = async () => { loading.value=true; try { await challengeStore.fetchChallenges() } finally { loading.value=false } }
    const reset = () => { challengeForm.title=''; challengeForm.goal=''; challengeForm.startDate=''; challengeForm.endDate=''; challengeForm.invites=[] }
    const createChallenge = () => { challengeFormRef.value.validate(async valid => { if(!valid) return; creating.value=true; try { await challengeStore.createChallenge({ ...challengeForm }) ; reset(); refresh() } finally { creating.value=false } }) }
    const participantsDialog = ref(false)
    const participants = ref([])
    const viewParticipants = async (row) => { const list = await challengeStore.fetchParticipants(row.challengeId); participants.value = list; participantsDialog.value=true }
    onMounted(refresh)
    return { challengeStore, loading, creating, challengeForm, rules, challengeFormRef, refresh, reset, createChallenge, participantsDialog, participants, viewParticipants }
  }
}
</script>
<style scoped>
</style>
