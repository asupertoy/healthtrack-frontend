<template>
  <div>
    <el-page-header content="记录搜索" />
    <el-tabs v-model="active" class="search-tabs">
      <el-tab-pane label="预约搜索" name="appointments">
        <SectionCard title="预约过滤条件">
          <el-form :model="appointmentQuery" label-width="100px" class="filter-form">
            <el-form-item label="用户ID">
              <el-input v-model="appointmentQuery.userId" />
            </el-form-item>
            <el-form-item label="提供者ID">
              <el-input v-model="appointmentQuery.providerId" />
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker v-model="appointmentQuery.startDate" type="date" />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker v-model="appointmentQuery.endDate" type="date" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="searchingAppointments" @click="searchAppointments">搜索</el-button>
              <el-button @click="resetAppointments">重置</el-button>
            </el-form-item>
          </el-form>
        </SectionCard>
        <SectionCard title="结果">
          <el-table :data="appointmentResults" size="small" empty-text="暂无数据" v-loading="searchingAppointments">
            <el-table-column prop="appointmentId" label="ID" width="80" />
            <el-table-column prop="userName" label="用户" />
            <el-table-column prop="providerName" label="提供者" />
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="date" label="日期" />
          </el-table>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="健康记录搜索" name="records">
        <SectionCard title="健康记录过滤条件">
          <el-form :model="recordQuery" label-width="100px" class="filter-form">
            <el-form-item label="用户ID">
              <el-input v-model="recordQuery.userId" />
            </el-form-item>
            <el-form-item label="开始日期">
              <el-date-picker v-model="recordQuery.startDate" type="date" />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker v-model="recordQuery.endDate" type="date" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="searchingRecords" @click="searchRecords">搜索</el-button>
              <el-button @click="resetRecords">重置</el-button>
            </el-form-item>
          </el-form>
        </SectionCard>
        <SectionCard title="结果">
          <el-table :data="recordResults" size="small" empty-text="暂无数据" v-loading="searchingRecords">
            <el-table-column prop="recordId" label="记录ID" width="90" />
            <el-table-column prop="userName" label="用户" />
            <el-table-column prop="metric" label="指标" />
            <el-table-column prop="value" label="数值" />
            <el-table-column prop="date" label="日期" />
          </el-table>
        </SectionCard>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useHealthStore } from '../stores/healthStore'
import { useAppointmentStore } from '../stores/appointmentStore'
import SectionCard from '../components/SectionCard.vue'
import { useNotificationStore } from '../stores/notificationStore'

export default {
  components: { SectionCard },
  setup() {
    const healthStore = useHealthStore()
    const appointmentStore = useAppointmentStore()
    const ns = useNotificationStore()
    const active = ref('appointments')
    const appointmentQuery = reactive({ userId: '', providerId: '', startDate: '', endDate: '' })
    const recordQuery = reactive({ userId: '', startDate: '', endDate: '' })
    const appointmentResults = ref([])
    const recordResults = ref([])
    const searchingAppointments = ref(false)
    const searchingRecords = ref(false)

    // 简单示例：当前端已经加载了全部数据后，在前端做过滤。
    const searchAppointments = async () => {
      searchingAppointments.value = true
      try {
        // 确保有基础数据
        if (!appointmentStore.appointments.length) {
          await appointmentStore.fetchAppointments()
        }
        const list = appointmentStore.appointments
        appointmentResults.value = list // TODO: 根据 appointmentQuery 做过滤
        ns.push('info', '当前仅做简单演示过滤，可按需求扩展')
      } finally {
        searchingAppointments.value = false
      }
    }

    const searchRecords = async () => {
      searchingRecords.value = true
      try {
        // 确保有基础数据
        if (!healthStore.healthRecords.length && recordQuery.userId) {
          await healthStore.fetchHealthRecords(recordQuery.userId)
        }
        const list = healthStore.healthRecords
        recordResults.value = list // TODO: 根据 recordQuery 做过滤
        ns.push('info', '当前仅做简单演示过滤，可按需求扩展')
      } finally {
        searchingRecords.value = false
      }
    }

    const resetAppointments = () => {
      appointmentQuery.userId = ''
      appointmentQuery.providerId = ''
      appointmentQuery.startDate = ''
      appointmentQuery.endDate = ''
      appointmentResults.value = []
    }

    const resetRecords = () => {
      recordQuery.userId = ''
      recordQuery.startDate = ''
      recordQuery.endDate = ''
      recordResults.value = []
    }

    return {
      active,
      appointmentQuery,
      recordQuery,
      appointmentResults,
      recordResults,
      searchingAppointments,
      searchingRecords,
      searchAppointments,
      searchRecords,
      resetAppointments,
      resetRecords,
    }
  },
}
</script>

<style scoped>
.search-tabs { margin-top:10px; }
.filter-form { max-width:780px; }
</style>
