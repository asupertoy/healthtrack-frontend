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
      <el-table
        :data="familyStore.groups"
        size="small"
        empty-text="暂无家庭组"
        @row-click="selectGroup"
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="groupId" label="ID" width="90" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="成员数量" width="110">
          <template #default="{ row }">{{ row.members?.length || 0 }}</template>
        </el-table-column>
      </el-table>
    </SectionCard>
    <SectionCard v-if="currentGroup" :title="'成员 - ' + currentGroup.name">
      <div class="flex-row">
        <el-input v-model="newMemberUserId" placeholder="用户ID" style="max-width:200px" />
        <el-button type="primary" :disabled="!newMemberUserId" @click="addMember">添加成员</el-button>
      </div>
      <el-table :data="familyStore.members" size="small" empty-text="暂无成员">
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="userName" label="姓名" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click.stop="removeMember(row.memberId)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useFamilyStore } from '../stores/familyStore'
import SectionCard from '../components/SectionCard.vue'
import { useNotificationStore } from '../stores/notificationStore'

export default {
  components: { SectionCard },
  setup() {
    const familyStore = useFamilyStore()
    const ns = useNotificationStore()
    const newGroupName = ref('')
    const newMemberUserId = ref('')
    const currentGroup = ref(null)

    const refresh = async () => {
      try {
        await familyStore.fetchGroups()
      } catch (e) {
        ns.push('error', e.message || '加载家庭组失败')
      }
    }

    const createGroup = async () => {
      if (!newGroupName.value) return
      try {
        await familyStore.createGroup({ name: newGroupName.value })
        ns.push('success', '家庭组已创建')
        newGroupName.value = ''
        refresh()
      } catch (e) {
        ns.push('error', e.message || '创建家庭组失败')
      }
    }

    const selectGroup = async row => {
      try {
        currentGroup.value = row
        await familyStore.fetchGroupDetail(row.groupId)
      } catch (e) {
        ns.push('error', e.message || '加载成员失败')
      }
    }

    const addMember = async () => {
      if (!currentGroup.value) return
      try {
        await familyStore.addMember(currentGroup.value.groupId, newMemberUserId.value, 'MEMBER')
        ns.push('success', '成员已添加')
        newMemberUserId.value = ''
      } catch (e) {
        ns.push('error', e.message || '添加成员失败')
      }
    }

    const removeMember = async memberId => {
      try {
        await familyStore.removeMember(memberId)
        ns.push('warning', '成员已移除')
      } catch (e) {
        ns.push('error', e.message || '移除成员失败')
      }
    }

    onMounted(refresh)

    return {
      familyStore,
      newGroupName,
      createGroup,
      currentGroup,
      selectGroup,
      newMemberUserId,
      addMember,
      removeMember,
    }
  },
}
</script>

<style scoped>
.flex-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
</style>
