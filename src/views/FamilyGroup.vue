<template>
  <div>
    <el-page-header content="家庭组" />
    <!-- 我的家庭组：当前选中的家庭组 -->
    <SectionCard title="我的家庭组">
      <div style="margin-bottom:8px">
        <el-button size="small" @click="refresh">刷新</el-button>
      </div>
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
import { useUserStore } from '../stores/userStore'

export default {
  components: { SectionCard },
  setup() {
    const familyStore = useFamilyStore()
    const ns = useNotificationStore()
    const userStore = useUserStore()
    const currentGroup = ref(null)
    const members = ref([])
    const loading = ref(false)

    const myGroups = computed(() => (currentGroup.value ? [currentGroup.value] : []))

    const refreshGroups = async () => {
      try {
        loading.value = true
        await familyStore.fetchGroups()
        return familyStore.groups || []
      } catch (e) {
        ns.push('error', e.message || '加载家庭组失败')
        return []
      } finally {
        loading.value = false
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

    const findMyGroup = async () => {
      try {
        // ensure user loaded
        if (!userStore.user && userStore.userId) await userStore.restoreSession()
        const userId = userStore.user?.userId || userStore.userId
        if (!userId) return

        const all = await refreshGroups()
        // iterate groups and attempt to find membership
        for (const g of all || []) {
          const gid = g.groupId ?? g.id
          if (!gid) continue
          const mems = await familyStore.fetchMembers(gid)
          // backend now returns members with userId field
          const found = (mems || []).find(m => m.userId === userId)
          if (found) {
            currentGroup.value = g
            members.value = mems || []
            return
          }
        }
        // none found
        currentGroup.value = null
        members.value = []
      } catch (e) {
        ns.push('error', e.message || '查找用户家庭组失败')
      }
    }

    const refresh = async () => { await findMyGroup() }

    onMounted(async () => { await findMyGroup() })

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
      refresh,
      loading,
    }
  },
}
</script>

<style>
</style>
