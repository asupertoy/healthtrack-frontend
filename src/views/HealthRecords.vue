<template>
  <div>
    <el-page-header content="健康记录" @back="handleBack" />
    <!-- 月度健康小结 -->
    <SectionCard title="月度健康小结">
      <div class="filters">
        <el-input-number v-model="year" :min="2000" :max="2100" label="年份" />
        <el-input-number v-model="month" :min="1" :max="12" label="月份" />
        <el-button type="primary" :loading="loading" @click="fetch">刷新本月数据</el-button>
      </div>
      <el-table :data="metricSummary" size="small" style="margin-top:8px" empty-text="本月暂无健康记录">
        <el-table-column prop="metricType" label="指标类型" />
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column prop="avg" label="平均值" />
        <el-table-column prop="min" label="最小值" />
        <el-table-column prop="max" label="最大值" />
        <el-table-column prop="count" label="记录数" width="90" />
      </el-table>
    </SectionCard>

    <!-- 新增记录表单 -->
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
    <!-- 记录列表和编辑对话框 -->
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
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '../components/SectionCard.vue'
import { useHealthStore } from '../stores/healthStore'
import healthApi from '../api/healthApi'
import { useUserStore } from '../stores/userStore'
import { useNotificationStore } from '../stores/notificationStore'
export default {
  components:{ SectionCard },
  setup(){
    const router = useRouter()
    const handleBack = () => { router.back() }
    const healthStore = useHealthStore()
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const loading = ref(false)
    const creating = ref(false)
    const updating = ref(false)
    const records = ref([])
    const formRef = ref(null)
    const form = reactive({ recordDate:'', metricType:'', metricValue:null, metricUnit:'' })
    const rules = {
      recordDate:[{required:true,message:'必填',trigger:'change'}],
      metricType:[{required:true,message:'必填',trigger:'blur'}],
      metricValue:[{required:true,message:'数值必填',trigger:'blur'}],
    }
    const editVisible = ref(false)
    const editForm = reactive({ recordId:null, recordDate:'', metricType:'', metricValue:null, metricUnit:'' })
    const getUserId = () => userStore.user?.userId || userStore.userId || 1

    // 月份选择（默认当前月份）
    const year = ref(new Date().getFullYear())
    const month = ref(new Date().getMonth() + 1)

    // 类型到单位映射
    const typeToUnit = type => {
      switch (type) {
        case 'weight':
          return 'kg'
        case 'blood_pressure':
          return 'mmHg'
        case 'heart_rate':
          return 'bpm'
        case 'steps':
          return '步'
        default:
          return ''
      }
    }

    // 选择类型时自动填单位
    watch(
      () => form.metricType,
      newType => {
        form.metricUnit = typeToUnit(newType)
      }
    )

    const fetch = async () => {
      loading.value=true
      try {
        const list = await healthStore.fetchHealthRecords(getUserId())
        // 不再按日期范围查询，只缓存全部记录，后面按月份过滤
        records.value = list
      } finally {
        loading.value=false
      }
    }

    const resetForm = () => { form.recordDate=''; form.metricType=''; form.metricValue=null; form.metricUnit='' }
    const createRecord = () => { formRef.value.validate(async valid => { if(!valid) return; creating.value=true; try { const created = await healthApi.createRecord(getUserId(), { recordDate:form.recordDate, metricType:form.metricType, metricValue:form.metricValue, metricUnit:form.metricUnit }); records.value.push(created); ns.push('success','记录已添加'); resetForm() } finally { creating.value=false } }) }
    const startEdit = (row) => { Object.assign(editForm, row); editVisible.value=true }
    const updateRecord = async () => { updating.value=true; try { const updated = await healthApi.updateRecord({ id:editForm.recordId, recordDate:editForm.recordDate, metricType:editForm.metricType, metricValue:editForm.metricValue, metricUnit:editForm.metricUnit }); const idx = records.value.findIndex(r=>r.recordId===editForm.recordId); if(idx!==-1) records.value[idx]=updated; ns.push('info','记录已更新'); editVisible.value=false } finally { updating.value=false } }
    const removeRecord = async (id) => { await healthApi.deleteRecord(id); records.value = records.value.filter(r=>r.recordId!==id); ns.push('warning','记录已删除') }

    // 计算当前选择月份的指标统计
    const metricSummary = computed(() => {
      if (!records.value.length) return []
      const ym = `${year.value}-${String(month.value).padStart(2,'0')}`
      const monthRecords = records.value.filter(r => (r.recordDate || '').startsWith(ym))
      if (!monthRecords.length) return []
      const groups = {}
      monthRecords.forEach(r => {
        const key = r.metricType
        if (!groups[key]) {
          groups[key] = { values: [], unit: r.metricUnit || typeToUnit(r.metricType) }
        }
        const v = Number(r.metricValue)
        if (!Number.isNaN(v)) groups[key].values.push(v)
      })
      return Object.entries(groups).map(([metricType, { values, unit }]) => {
        if (!values.length) {
          return { metricType, unit, avg: null, min: null, max: null, count: 0 }
        }
        const sum = values.reduce((a,b) => a + b, 0)
        return {
          metricType,
          unit,
          avg: (sum / values.length).toFixed(1),
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        }
      })
    })

    fetch()
    return { year, month, metricSummary, query: {}, form, rules, formRef, resetForm, createRecord, records, loading, fetch, editVisible, editForm, startEdit, updateRecord, removeRecord, creating, updating, handleBack }
  }
}
</script>
<style scoped>
.filters { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:4px; }
.record-form { max-width:560px; }
</style>
