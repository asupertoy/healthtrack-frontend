<template>
  <div>
    <el-page-header content="健康记录" />
    <SectionCard title="查询条件">
      <div class="filters">
        <el-date-picker v-model="query.startDate" type="date" placeholder="开始日期" />
        <el-date-picker v-model="query.endDate" type="date" placeholder="结束日期" />
        <el-button type="primary" :loading="loading" @click="fetch">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>
    </SectionCard>
    <SectionCard title="新增记录">
      <el-form :model="form" ref="formRef" label-width="90px" :rules="rules" class="record-form">
        <el-form-item label="日期" prop="recordDate">
          <el-date-picker v-model="form.recordDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="类型" prop="metricType">
          <el-select v-model="form.metricType" placeholder="指标类型" filterable>
            <el-option label="步数" value="steps" />
            <el-option label="体重" value="weight" />
            <el-option label="血压" value="blood_pressure" />
            <el-option label="心率" value="heart_rate" />
          </el-select>
        </el-form-item>
        <el-form-item label="数值" prop="metricValue">
          <el-input-number v-model="form.metricValue" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.metricUnit" placeholder="例如 kg / bpm" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="creating" @click="createRecord">新增</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </SectionCard>
    <SectionCard title="记录列表">
      <el-table :data="records" v-loading="loading" size="small" empty-text="暂无记录" @row-dblclick="startEdit">
        <el-table-column type="index" width="50" />
        <el-table-column prop="recordDate" label="日期" />
        <el-table-column prop="metricType" label="类型" />
        <el-table-column prop="metricValue" label="数值" />
        <el-table-column prop="metricUnit" label="单位" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="startEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeRecord(row.recordId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </SectionCard>
    <el-dialog v-model="editVisible" title="编辑记录" width="420px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="日期">
          <el-date-picker v-model="editForm.recordDate" type="date" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="editForm.metricType" />
        </el-form-item>
        <el-form-item label="数值">
          <el-input-number v-model="editForm.metricValue" :min="0" />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="editForm.metricUnit" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible=false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="updateRecord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { ref, reactive } from 'vue'
import SectionCard from '../components/SectionCard.vue'
import { useHealthStore } from '../stores/healthStore'
import healthApi from '../api/healthApi'
import { useUserStore } from '../stores/userStore'
import { useNotificationStore } from '../stores/notificationStore'
export default {
  components:{ SectionCard },
  setup(){
    const healthStore = useHealthStore()
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const loading = ref(false)
    const creating = ref(false)
    const updating = ref(false)
    const records = ref([])
    const formRef = ref(null)
    const query = reactive({ startDate:'', endDate:'' })
    const form = reactive({ recordDate:'', metricType:'', metricValue:null, metricUnit:'' })
    const rules = { recordDate:[{required:true,message:'必填',trigger:'change'}], metricType:[{required:true,message:'必填',trigger:'blur'}] }
    const editVisible = ref(false)
    const editForm = reactive({ recordId:null, recordDate:'', metricType:'', metricValue:null, metricUnit:'' })
    const getUserId = () => userStore.user?.userId || 1
    const fetch = async () => { loading.value=true; try { records.value = await healthStore.fetchHealthRecords(getUserId(), query.startDate, query.endDate) } finally { loading.value=false } }
    const resetQuery = () => { query.startDate=''; query.endDate=''; records.value=[] }
    const resetForm = () => { form.recordDate=''; form.metricType=''; form.metricValue=null; form.metricUnit='' }
    const createRecord = () => { formRef.value.validate(async valid => { if(!valid) return; creating.value=true; try { const created = await healthApi.createRecord({ userId:getUserId(), recordDate:form.recordDate, metricType:form.metricType, metricValue:form.metricValue, metricUnit:form.metricUnit }); records.value.push(created); ns.push('success','记录已添加'); resetForm() } finally { creating.value=false } }) }
    const startEdit = (row) => { Object.assign(editForm, row); editVisible.value=true }
    const updateRecord = async () => { updating.value=true; try { const updated = await healthApi.updateRecord(editForm.recordId, { recordDate:editForm.recordDate, metricType:editForm.metricType, metricValue:editForm.metricValue, metricUnit:editForm.metricUnit }); const idx = records.value.findIndex(r=>r.recordId===editForm.recordId); if(idx!==-1) records.value[idx]=updated; ns.push('info','记录已更新'); editVisible.value=false } finally { updating.value=false } }
    const removeRecord = async (id) => { await healthApi.deleteRecord(id); records.value = records.value.filter(r=>r.recordId!==id); ns.push('warning','记录已删除') }
    fetch()
    return { query, form, rules, formRef, resetForm, createRecord, records, loading, fetch, resetQuery, editVisible, editForm, startEdit, updateRecord, removeRecord, creating, updating }
  }
}
</script>
<style scoped>
.filters { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:4px; }
.record-form { max-width:560px; }
</style>

