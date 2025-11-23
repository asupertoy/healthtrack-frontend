<template>
  <div>
    <el-page-header content="预约管理" />
    <SectionCard title="创建预约">
      <el-form :model="form" label-width="110px" ref="formRef" :rules="rules" class="create-form">
        <el-form-item label="提供者执照号" prop="providerLicense">
          <el-input v-model="form.providerLicense" placeholder="例如: DOC-123" />
        </el-form-item>
        <el-form-item label="日期时间" prop="datetime">
          <el-date-picker v-model="form.datetime" type="datetime" placeholder="选择日期时间" style="width:100%" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="选择类型">
            <el-option label="面诊" value="IN_PERSON" />
            <el-option label="视频" value="VIRTUAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.memo" type="textarea" :rows="2" placeholder="症状或问题（可选）" />
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
      <el-table :data="appointmentStore.appointments" v-loading="loading" size="small" style="width:100%;" empty-text="暂无预约">
        <el-table-column type="index" width="50" />
        <el-table-column prop="appointmentId" label="ID" width="90" />
        <el-table-column prop="date" label="日期" />
        <el-table-column prop="providerName" label="医生/机构" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="openCancel(row)">取消</el-button>
            <el-button size="small" type="danger" @click="deleteAppointment(row.appointmentId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>

    <el-dialog v-model="cancelDialogVisible" title="取消预约" width="420px">
      <el-form :model="cancelForm" label-width="100px">
        <el-form-item label="原因" prop="reason">
          <el-select v-model="cancelForm.reason" placeholder="选择取消原因">
            <el-option label="患者改期" value="PATIENT_RESCHEDULE" />
            <el-option label="医生无法应诊" value="PROVIDER_UNAVAILABLE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="cancelForm.reason === 'OTHER'" label="备注">
          <el-input v-model="cancelForm.memo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialogVisible=false">关闭</el-button>
        <el-button type="primary" :loading="cancelling" @click="confirmCancel">确认取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue'
import { useAppointmentStore } from '../stores/appointmentStore'
import { useUserStore } from '../stores/userStore'
import SectionCard from '../components/SectionCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
export default {
  components:{ SectionCard, LoadingSpinner },
  setup() {
    const appointmentStore = useAppointmentStore()
    const userStore = useUserStore()
    const loading = ref(false)
    const creating = ref(false)
    const cancelling = ref(false)
    const formRef = ref(null)
    const form = reactive({ providerLicense:'', datetime:'', type:'', memo:'' })
    const rules = { providerLicense:[{required:true,message:'必填',trigger:'blur'}], datetime:[{required:true,message:'请选择时间',trigger:'change'}], type:[{required:true,message:'选择类型',trigger:'change'}] }
    const getUserId = () => userStore.user?.userId || 1
    const refresh = async () => { loading.value=true; try { await appointmentStore.fetchAppointments(getUserId()) } finally { loading.value=false } }
    const reset = () => { form.providerLicense=''; form.datetime=''; form.type=''; form.memo='' }
    const create = () => { formRef.value.validate(async valid => { if(!valid) return; creating.value=true; try { await appointmentStore.createAppointment({ userId:getUserId(), providerLicense:form.providerLicense, date:form.datetime, type:form.type, memo:form.memo }) ; reset(); refresh() } finally { creating.value=false } }) }
    const deleteAppointment = async (id) => { await appointmentStore.deleteAppointment(id); refresh() }
    const cancelDialogVisible = ref(false)
    const cancelForm = reactive({ reason:'', memo:'' })
    const targetCancelAppointmentId = ref(null)
    const openCancel = (row) => { targetCancelAppointmentId.value = row.appointmentId; cancelDialogVisible.value=true }
    const confirmCancel = async () => { cancelling.value=true; try { /* 调用后端取消接口: appointmentStore.updateAppointment(...) 加 reason */ await appointmentStore.updateAppointment(targetCancelAppointmentId.value, { status:'CANCELLED', cancelReason:cancelForm.reason, cancelMemo:cancelForm.memo }) ; cancelDialogVisible.value=false; refresh() } finally { cancelling.value=false } }
    onMounted(refresh)
    return { appointmentStore, loading, creating, form, rules, formRef, create, reset, refresh, deleteAppointment, cancelDialogVisible, cancelForm, openCancel, confirmCancel, cancelling }
  }
}
</script>
<style scoped>
.create-form { max-width:600px; }
.toolbar { margin-bottom:10px; display:flex; gap:10px; }
</style>
