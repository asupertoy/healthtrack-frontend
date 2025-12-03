<template>
  <div>
    <el-page-header content="家庭组" />
    <!-- 我的家庭组：当前选中的家庭组 -->
    <SectionCard title="我的家庭组">
      <el-table
        :data="myGroups"
        size="small"
        empty-text="当前用户尚未加入任何家庭组"
        @row-click="selectGroup"
      >
        <el-table-column type="index" width="50" />
        <el-table-column label="家庭组ID" width="140">
          <template #default="{ row }">
            {{ row.groupId ?? row.id ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="家庭组名称">
          <template #default="{ row }">
            {{ row.groupName ?? row.name ?? '-' }}
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <!-- 当前家庭组的成员信息 -->
    <SectionCard v-if="currentGroup" :title="'成员列表 - ' + (currentGroup.groupName || currentGroup.name || '')">
      <el-table :data="members" size="small" empty-text="该家庭组暂无成员">
        <!-- 自动序号 -->
        <el-table-column type="index" width="50" />
        <!-- userId -->
        <el-table-column prop="userId" label="用户ID" width="100" />
        <!-- 名字 -->
        <el-table-column prop="userName" label="姓名" width="150" />
        <!-- 角色 -->
        <el-table-column prop="role" label="身份" width="120" />
        <!-- 权限 -->
        <el-table-column prop="permission" label="权限" width="140" />
        <!-- 加入时间 -->
        <el-table-column label="加入时间">
          <template #default="{ row }">
            {{ formatJoinedAt(row.joinedAt) }}
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useFamilyStore } from '../stores/familyStore'
import { useNotificationStore } from '../stores/notificationStore'
import SectionCard from '../components/SectionCard.vue'

export default {
  components: { SectionCard },
  setup() {
    const familyStore = useFamilyStore()
    const ns = useNotificationStore()
    const currentGroup = ref(null)
    const members = ref([])

    const groups = computed(() => familyStore.groups || [])
    const myGroups = computed(() => (currentGroup.value ? [currentGroup.value] : []))

    const refreshGroups = async () => {
      try {
        await familyStore.fetchGroups()
      } catch (e) {
        ns.push('error', e.message || '加载家庭组失败')
      }
    }

    const loadMembers = async group => {
      try {
        const gid = group.groupId ?? group.id
        if (!gid) {
          ns.push('error', '无法确定家庭组ID')
          return
        }
        const data = await familyStore.fetchMembers(gid)
        members.value = data || []
      } catch (e) {
        ns.push('error', e.message || '加载家庭组成员失败')
      }
    }

    const selectGroup = async row => {
      currentGroup.value = row
      await loadMembers(row)
    }

    onMounted(async () => {
      await refreshGroups()
      if (groups.value.length > 0 && !currentGroup.value) {
        currentGroup.value = groups.value[0]
        await loadMembers(currentGroup.value)
      }
    })

    // 将 "2025-11-27T13:15:21" 或 "2025-11-27 13:15:21" 统一显示为 "2025-11-27 13:15:21"
    const formatJoinedAt = (value) => {
      if (!value) return ''
      if (typeof value === 'string') {
        // 如果包含 'T'，替换为空格
        if (value.includes('T')) return value.replace('T', ' ')
        return value
      }
      return String(value)
    }

    return {
      myGroups,
      currentGroup,
      members,
      selectGroup,
      formatJoinedAt,
    }
  },
}
</script>

<style scoped>
.flex-row { display:flex; gap:10px; align-items:center; margin-bottom:10px; }
</style>
