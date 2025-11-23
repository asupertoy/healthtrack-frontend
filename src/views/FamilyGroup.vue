<template>
  <div>
    <el-page-header content="家庭组" />
    <SectionCard title="创建家庭组">
      <div class="flex-row">
        <el-input v-model="newGroupName" placeholder="家庭组名称" style="max-width:240px" />
        <el-button type="primary" :disabled="!newGroupName" @click="createGroup">创建</el-button>
      </div>
    </SectionCard>
    <SectionCard title="家庭组列表">
      <el-table :data="familyStore.groups" size="small" empty-text="暂无家庭组" @row-click="selectGroup">
        <el-table-column type="index" width="50" />
        <el-table-column prop="groupId" label="ID" width="90" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="成员数量" width="110" >
          <template #default="{ row }">{{ row.members?.length || 0 }}</template>
        </el-table-column>
      </el-table>
    </SectionCard>
    <SectionCard v-if="currentGroup" :title="'成员 - ' + currentGroup.name">
      <div class="flex-row">
        <el-input v-model="newMemberUserId" placeholder="用户ID" style="max-width:200px" />
        <el-button type="primary" :disabled="!newMemberUserId" @click="addMember">添加成员</el-button>
      </div>
      <el-table :data="members" size="small" empty-text="暂无成员">
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="userName" label="姓名" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="removeMember(row.memberId)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import { useFamilyStore } from '../stores/familyStore'
import { useUserStore } from '../stores/userStore'
import SectionCard from '../components/SectionCard.vue'
export default {
  components:{ SectionCard },
  setup() {
    const familyStore = useFamilyStore()
    const userStore = useUserStore()
    const newGroupName = ref('')
    const newMemberUserId = ref('')
    const currentGroup = ref(null)
    const members = ref([])
    const getUserId = () => userStore.user?.userId || 1
    const refresh = async () => { await familyStore.fetchGroups(getUserId()) }
    const createGroup = async () => { if(!newGroupName.value) return; await familyStore.createGroup({ name:newGroupName.value }); newGroupName.value=''; refresh() }
    const selectGroup = async (row) => { currentGroup.value = row; const detail = await familyStore.fetchGroupDetail(row.groupId); members.value = detail.members || [] }
    const addMember = async () => { if(!currentGroup.value) return; const added = await familyStore.addMember(currentGroup.value.groupId, newMemberUserId.value); members.value.push(added); newMemberUserId.value='' }
    const removeMember = async (memberId) => { await familyStore.removeMember(memberId); members.value = members.value.filter(m=>m.memberId!==memberId) }
    onMounted(refresh)
    return { familyStore, newGroupName, createGroup, currentGroup, selectGroup, newMemberUserId, addMember, removeMember, members }
  }
}
</script>
<style scoped>
.flex-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
</style>
