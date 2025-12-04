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
          <el-date-picker v-model="form.recordDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="类型" prop="metricType">
          <el-select v-model="form.metricType" placeholder="指标类型" filterable>
            <el-option label="步数" value="steps" />
            <el-option label="体重" value="weight" />
            <el-option label="身高" value="height" />
            <el-option label="摄入卡路里" value="calories" />
            <el-option label="血压" value="blood_pressure" />
            <el-option label="心率" value="heart_rate" />
            <el-option label="睡眠时长" value="sleep_duration" />
          </el-select>
        </el-form-item>
        <el-form-item label="数值" prop="metricValue">
          <!-- 血压使用 systolic/diastolic 组合输入，例如 120/80 -->
          <template v-if="form.metricType === 'blood_pressure'">
            <el-input
              v-model="form.metricValue"
              placeholder="请输入血压，例如 120/80"
            />
          </template>
          <template v-else>
            <el-input-number v-model="form.metricValue" :min="0" :step="1" />
          </template>
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
      <el-table :data="sortedRecords" v-loading="loading" size="small" empty-text="暂无记录" @row-dblclick="startEdit">
        <el-table-column type="index" width="50" />
        <el-table-column prop="recordDate" label="日期" />
        <el-table-column prop="metricType" label="类型" />
        <el-table-column label="数值">
          <template #default="{ row }">
            {{ formatMetricValue(row) }}
          </template>
        </el-table-column>
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
          <el-date-picker v-model="editForm.recordDate" type="date" value-format="YYYY-MM-DD" />
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
import { ref, reactive, watch, computed, onMounted } from 'vue'
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
    const getUserId = () => userStore.user?.userId || userStore.userId || null
    const ensureUserLoaded = async () => {
      if (!userStore.user && userStore.userId) {
        await userStore.restoreSession()
      }
      return userStore.user?.userId || userStore.userId || null
    }

   // 月份选择（默认当前月份）
   const year = ref(new Date().getFullYear())
   const month = ref(new Date().getMonth() + 1)

   // 类型到单位映射
   const typeToUnit = type => {
     switch (type) {
       case 'weight':
         return 'kg'
      case 'height':
        return 'cm'
      case 'calories':
        return 'kcal'
       case 'blood_pressure':
         return 'mmHg'
      case 'blood_pressure_systolic':
      case 'blood_pressure_diastolic':
        return 'mmHg'
       case 'heart_rate':
         return 'bpm'
      case 'sleep_duration':
        return 'hours'
       case 'steps':
         return 'count'
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
       const uid = await ensureUserLoaded()
       if (!uid) {
         records.value = []
         return
       }
       const list = await healthStore.fetchHealthRecords(uid)
       // 缓存全部记录，后面按月份过滤
       records.value = list || []
     } finally {
       loading.value=false
     }
   }

   const resetForm = () => { form.recordDate=''; form.metricType=''; form.metricValue=null; form.metricUnit='' }

    // Format metric value; for blood_pressure when metricValue is null, show metricJson contents
    const formatMetricValue = (row) => {
      if (!row) return ''
      const type = row.metricType
      const val = row.metricValue
      const mjson = row.metricJson || row.metric_json || row.metricJSON || null
      if (type === 'blood_pressure') {
        // 优先解析 metricValue 中的 "systolic/diastolic" 形式
        if (typeof val === 'string' && val.includes('/')) {
          const parts = val.split('/').map(p => p.trim()).filter(Boolean)
          if (parts.length === 2) return `${parts[0]}/${parts[1]}`
        }
        if (val === null || val === undefined || val === '') {
          if (!mjson) return ''
          let obj = mjson
          if (typeof mjson === 'string') {
            try { obj = JSON.parse(mjson) } catch (e) { return mjson }
          }
          const s = obj.systolic ?? obj.systolicPressure ?? obj.s ?? obj.sys ?? null
          const d = obj.diastolic ?? obj.diastolicPressure ?? obj.d ?? obj.dia ?? null
          if (s != null && d != null) return `${s}/${d}`
          try { return JSON.stringify(obj) } catch (e) { return String(obj) }
        }
        // 其他情况下直接展示数值
        return val == null ? '' : String(val)
      }
      // default display
      return val == null ? '' : String(val)
    }

    const createRecord = () => { formRef.value.validate(async valid => { if(!valid) return; creating.value=true; try { const created = await healthApi.createRecord(getUserId(), { recordDate:form.recordDate, metricType:form.metricType, metricValue:form.metricValue, metricUnit:form.metricUnit }); records.value.push(created); ns.push('success','记录已添加'); resetForm() } finally { creating.value=false } }) }
    const startEdit = (row) => { Object.assign(editForm, row); editVisible.value=true }
    const updateRecord = async () => { updating.value=true; try { const updated = await healthApi.updateRecord({ id:editForm.recordId, recordDate:editForm.recordDate, metricType:editForm.metricType, metricValue:editForm.metricValue, metricUnit:editForm.metricUnit }); const idx = records.value.findIndex(r=>r.recordId===editForm.recordId); if(idx!==-1) records.value[idx]=updated; ns.push('info','记录已更新'); editVisible.value=false } finally { updating.value=false } }
    const removeRecord = async (id) => { await healthApi.deleteRecord(id); records.value = records.value.filter(r=>r.recordId!==id); ns.push('warning','记录已删除') }

   // 计算当前选择月份的指标统计（血压拆分为收缩/舒张分别统计）
   const metricSummary = computed(() => {
     if (!records.value.length) return []
     const ym = `${year.value}-${String(month.value).padStart(2,'0')}`
     const monthRecords = records.value.filter(r => (r.recordDate || '').startsWith(ym))
     if (!monthRecords.length) return []

     const groups = {}

     const pushValue = (key, value, unit) => {
       if (value == null || value === '') return
       const num = Number(value)
       if (Number.isNaN(num)) return
       if (!groups[key]) groups[key] = { values: [], unit }
       groups[key].values.push(num)
     }

     monthRecords.forEach(r => {
       const type = r.metricType
      // 新增类型：身高、卡路里，直接按类型聚合
      if (type === 'height' || type === 'calories') {
        const unit = r.metricUnit || typeToUnit(type)
        pushValue(type, r.metricValue, unit)
        return
      }
      if (type === 'sleep_duration') {
        const unit = r.metricUnit || typeToUnit(type)
        pushValue(type, r.metricValue, unit)
        return
      }
       // handle blood_pressure specially
       if (type === 'blood_pressure') {
         const mjson = r.metricJson || r.metric_json || r.metricJSON || null
         let obj = null
         if (mjson) {
           obj = typeof mjson === 'string' ? (() => { try { return JSON.parse(mjson) } catch(e){ return null } })() : mjson
         }
         const s = obj?.systolic ?? obj?.systolicPressure ?? obj?.s ?? obj?.sys ?? null
         const d = obj?.diastolic ?? obj?.diastolicPressure ?? obj?.d ?? obj?.dia ?? null
        // also if metricValue encodes combined value like '120/80', try parse
         if (typeof r.metricValue === 'string' && r.metricValue.includes('/')) {
           const parts = (r.metricValue || '').split('/').map(p => p.trim())
           if (parts.length === 2) {
             pushValue('blood_pressure_systolic', parts[0], 'mmHg')
             pushValue('blood_pressure_diastolic', parts[1], 'mmHg')
             return
           }
         }
         // push numeric metricValue if present (unlikely for BP)
         if (r.metricValue !== null && r.metricValue !== undefined && r.metricValue !== '') {
           const num = Number(r.metricValue)
           if (!Number.isNaN(num)) pushValue('blood_pressure_systolic', num, 'mmHg')
         }
         // push parsed s/d
         if (s != null) pushValue('blood_pressure_systolic', s, 'mmHg')
         if (d != null) pushValue('blood_pressure_diastolic', d, 'mmHg')
      } else if (type === 'blood_pressure_systolic' || type === 'blood_pressure_diastolic') {
        // 新的拆分类型：直接按各自类型聚合
        const unit = r.metricUnit || typeToUnit(type)
        pushValue(type, r.metricValue, unit)
       } else {
         const key = type
         const unit = r.metricUnit || typeToUnit(type)
         pushValue(key, r.metricValue, unit)
       }
     })

     // Map groups to display rows. For blood pressure keys, set friendly labels.
     const rows = []
     for (const [metricType, { values, unit }] of Object.entries(groups)) {
       if (!values || values.length === 0) {
         rows.push({ metricType, unit, avg: null, min: null, max: null, count: 0 })
         continue
       }
       const sum = values.reduce((a,b) => a + b, 0)
       const entry = {
         metricType,
         unit,
         avg: (sum / values.length).toFixed(1),
         min: Math.min(...values),
         max: Math.max(...values),
         count: values.length,
       }
       // Make metricType human-friendly for blood pressure
       if (metricType === 'blood_pressure_systolic') entry.metricType = 'blood_pressure (收缩)'
       if (metricType === 'blood_pressure_diastolic') entry.metricType = 'blood_pressure (舒张)'
       rows.push(entry)
     }
     // Optionally sort rows so blood pressure appear together and others alphabetical
     rows.sort((a,b) => {
       if (a.metricType.startsWith('blood_pressure') && !b.metricType.startsWith('blood_pressure')) return -1
       if (!a.metricType.startsWith('blood_pressure') && b.metricType.startsWith('blood_pressure')) return 1
       return String(a.metricType).localeCompare(String(b.metricType))
     })
     return rows
   })

   // 记录列表：按日期降序排列（日期越晚排在前面）
   const sortedRecords = computed(() => {
     const list = records.value || []
     return [...list].sort((a, b) => {
       const da = new Date(a.recordDate || a.date || 0)
       const db = new Date(b.recordDate || b.date || 0)
       return db - da // 日期晚的在前
     })
   })

   onMounted(() => { fetch() })
     return { year, month, metricSummary, query: {}, form, rules, formRef, resetForm, createRecord, records, sortedRecords, loading, fetch, editVisible, editForm, startEdit, updateRecord, removeRecord, creating, updating, handleBack, formatMetricValue }
   }
 }
</script>
<style scoped>
.filters { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:4px; }
.record-form { max-width:560px; }
</style>
