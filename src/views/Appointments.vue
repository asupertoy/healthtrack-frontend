<template>
  <div>
    <el-page-header content="预约管理" @back="handleBack" />
    <SectionCard title="创建预约">
      <el-form :model="form" label-width="110px" ref="formRef" :rules="rules" class="create-form">
        <!-- 预约对象：bookingUser 由当前登录用户决定，不在表单中输入 -->

        <!-- 医生：从已有医生列表按名字选择 -->
        <el-form-item label="医生" prop="providerId">
          <el-select
            v-model="form.providerId"
            filterable
            placeholder="请选择医生"
            :loading="providersLoading"
          >
            <el-option
              v-for="p in providers"
              :key="p.providerId"
              :label="p.name || (p.licenseNumber || p.email)"
              :value="p.providerId"
            />
          </el-select>
        </el-form-item>

        <!-- 必填：预约时间 -->
        <el-form-item label="日期时间" prop="datetime">
          <el-date-picker
            v-model="form.datetime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="选择日期时间"
            style="width:100%"
          />
        </el-form-item>

        <!-- 必填：面诊/视频 -->
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="选择类型">
            <el-option label="线下就诊" value="IN_PERSON" />
            <el-option label="线上就诊" value="VIRTUAL" />
          </el-select>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input
            v-model="form.memo"
            type="textarea"
            :rows="2"
            placeholder="症状、就诊目的等（可选）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="creating" @click="create">创建</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </SectionCard>

    <SectionCard title="预约列表">
      <div class="toolbar">
        <el-button type="primary" @click="refresh" :loading="loading">刷新</el-button>
      </div>
      <LoadingSpinner :visible="loading" text="加载中..." />
      <el-table :data="formattedAppointments" v-loading="loading" size="small" style="width:100%;" empty-text="暂无预约">
        <el-table-column type="index" width="50" />
        <!-- 医生姓名 -->
        <el-table-column prop="providerName" label="医生姓名" width="200"/>
        <!-- 预约时间（scheduledAt 格式化后） -->
        <el-table-column prop="date" label="预约时间" />
        <!-- 线上 / 线下 -->
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ row.consultationType === 'VIRTUAL' ? '线上就诊' : '线下就诊' }}
          </template>
        </el-table-column>
        <!-- 备注 memo -->
        <el-table-column prop="memo" label="备注" />
        <!-- 状态 -->
        <el-table-column label="预约状态" width="120">
          <template #default="{ row }">
            <template v-if="row.statusType">
              <el-tag :type="row.statusType">{{ row.status || 'UNKNOWN' }}</el-tag>
            </template>
            <template v-else>
              <el-tag>{{ row.status || 'UNKNOWN' }}</el-tag>
            </template>
          </template>
        </el-table-column>
        <!-- 创建时间 -->
        <el-table-column prop="createdAtFormatted" label="创建时间" />
        <el-table-column label="操作" width="210">
          <template #default="{ row }">
            <el-button size="small" @click="openCancel(row)" :disabled="(row.status || '').toString().toUpperCase() === 'CANCELLED'">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
  </div>
</template>
<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '../stores/appointmentStore'
import { useUserStore } from '../stores/userStore'
import SectionCard from '../components/SectionCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { formatLocalDateTime } from '../utils/dateUtils'
import { useNotificationStore } from '../stores/notificationStore'
import providerApi from '../api/providerApi'
import appointmentApi from '../api/appointmentApi'
import { ElMessageBox } from 'element-plus'

export default {
  components: { SectionCard, LoadingSpinner },
  setup() {
    const router = useRouter()
    const handleBack = () => {
      router.back()
    }

    const appointmentStore = useAppointmentStore()
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const loading = ref(false)
    const creating = ref(false)
    const cancelling = ref(false)
    const formRef = ref(null)
    const form = reactive({
      providerId: null,
      // 直接使用字符串形式的本地时间，如 '2025-12-02T10:30:00'
      datetime: '',
      type: '',
      memo: '',
    })
    const rules = {
      providerId: [{ required: true, message: '请选择医生', trigger: 'change' }],
      datetime: [{ required: true, message: '请选择时间', trigger: 'change' }],
      type: [{ required: true, message: '选择类型', trigger: 'change' }],
    }

    // 医生列表数据源（供创建预约时选择）
    const providers = ref([])
    const providersLoading = ref(false)

    // 不再使用额外缓存，直接通过 providerId 在 providers 列表中解析姓名

    // 根据预约记录中的 providerId 在 providers 列表中查找医生姓名
    const resolveProviderName = (appointment) => {
      if (!appointment) return ''
      const pid = appointment.providerId || appointment.provider?.providerId
      if (!pid) return ''
      const match = providers.value.find(p => String(p.providerId) === String(pid))
      return match?.name || ''
    }

    const getUserId = () => userStore.user?.userId || localStorage.getItem('userId') || 1

    const refresh = async () => {
      loading.value = true
      try {
        await appointmentStore.fetchAppointments()
        console.log('[Appointments] loaded appointments:', appointmentStore.appointments)
        console.log('[Appointments] loaded providers:', providers.value)
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '加载预约失败')
      } finally {
        loading.value = false
      }
    }

    const loadProviders = async () => {
      providersLoading.value = true
      try {
        // 获取所有 Provider 列表，让用户按名字选择
        providers.value = await providerApi.getProviders?.() || []
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '加载医生列表失败')
      } finally {
        providersLoading.value = false
      }
    }

    const reset = () => {
      form.providerId = null
      form.datetime = ''
      form.type = ''
      form.memo = ''
    }

    const create = async () => {
      // Manual validation first (always reliable)
      const missing = []
      if (!form.providerId) missing.push('医生')
      if (!form.datetime) missing.push('日期时间')
      if (!form.type) missing.push('类型')
      if (missing.length) {
        ns.push('error', `请填写：${missing.join('、')}`)
        return
      }

      // If Element Plus formRef exists, use it to show UI validation feedback
      if (formRef.value && typeof formRef.value.validate === 'function') {
        const valid = await new Promise(resolve => {
          formRef.value.validate(res => resolve(res))
        })
        if (!valid) return
      }

      creating.value = true
      try {
        const userId = getUserId()

        // scheduledAt 现在直接使用 form.datetime 字符串（已是 'YYYY-MM-DDTHH:mm:ss' 本地时间）
        const scheduledAt = form.datetime

        const payload = {
          bookingUserId: userId,
          providerId: form.providerId,
          scheduledAt,
          consultationType: form.type, // 'IN_PERSON' 或 'VIRTUAL'
          memo: form.memo || null,
        }

        console.log('Create appointment payload (CreateAppointmentRequest):', payload)
        await appointmentStore.createAppointment(payload)
        ns.push('success', '预约创建成功')
        reset()
        await refresh()
      } catch (e) {
        console.error('Create appointment failed:', {
          status: e?.response?.status,
          data: e?.response?.data,
          message: e?.message,
        })
        const serverMsg = e?.response?.data?.message || e?.response?.data || e.message || '创建预约失败'
        ns.push('error', serverMsg)
      } finally {
        creating.value = false
      }
    }

    const deleteAppointment = async id => {
      try {
        await appointmentStore.deleteAppointment(id)
        ns.push('info', '预约已删除')
        await refresh()
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '删除预约失败')
      }
    }

    const openCancel = async row => {
      if (!row || !row.appointmentId) return

      // 1) 让用户输入可选的取消原因
      let reason
      try {
        const res = await ElMessageBox.prompt('请输入取消原因（可留空）', '确认取消预约', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          inputPlaceholder: '可留空',
          inputType: 'text',
        })
        reason = res?.value ?? null
      } catch {
        // 用户取消输入
        return
      }

      cancelling.value = true
      try {
        // 2) 构造 CancelAppointmentRequest 请求体
        const body = {
          // 可选：你可以不传，让后端用当前时间；这里示例传前端时间
          cancelledAt: new Date().toISOString().slice(0, 19), // 截断为 "YYYY-MM-DDTHH:mm:ss"，更贴近 LocalDateTime
          cancellationReason: reason || null,
        }

        try {
          console.log('Calling PATCH /api/appointments/{id}/cancel with body:', body)
          await appointmentApi.cancelAppointment(row.appointmentId, body)
        } catch (err) {
          console.error('取消预约失败 body / error:', body, err?.response || err)
          ns.push('error', err?.response?.data?.message || err.message || '取消预约失败')
          return
        }

        ns.push('warning', '预约已取消')
        await refresh()
      } finally {
        cancelling.value = false
      }
    }

    // confirmCancel 已不再使用，可以保持空实现或后续删除
    const confirmCancel = async () => {}

    const normalizeStatusType = s => {
      if (s == null) return undefined
      const key = String(s).toUpperCase()
      switch (key) {
        case 'SCHEDULED': return 'info'
        case 'CANCELLED': return 'warning'
        case 'COMPLETED': return 'success'
        case 'NO_SHOW': return 'danger'
        default: return undefined
      }
    }

    const formattedAppointments = computed(() =>
      (appointmentStore.appointments || []).map(a => ({
        ...a,
        // 直接使用 providerId 在 providers 列表中解析姓名
        providerName: resolveProviderName(a),
        date: formatLocalDateTime(a.scheduledAt || a.date),
        createdAtFormatted: formatLocalDateTime(a.createdAt),
        statusType: normalizeStatusType(a.status),
      })),
    )

    onMounted(async () => {
      // 先加载医生列表，再按当前用户加载预约，这样 resolveProviderName 能立即工作
      await loadProviders()
      await refresh()
    })

    return {
      handleBack,
      form,
      rules,
      loading,
      creating,
      cancelling,
      refresh,
      reset,
      create,
      deleteAppointment,
      openCancel,
      confirmCancel,
      formattedAppointments,
      providers,
      providersLoading,
      formRef,
    }
  },
}
</script>

<style scoped>
/* 保持原有样式不变 */
</style>
