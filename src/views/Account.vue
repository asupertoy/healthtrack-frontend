<template>
  <div>
    <el-page-header content="账户信息" />
    <el-tabs v-model="activeTab" class="account-tabs">
      <el-tab-pane label="基本资料" name="profile">
        <SectionCard title="基本资料">
          <el-form :model="profile" label-width="100px" :rules="profileRules" ref="profileForm">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profile.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="主邮箱" prop="primaryEmail">
              <el-input v-model="profile.primaryEmail" placeholder="主邮箱" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profile.phone" placeholder="手机号" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
              <el-button @click="reloadProfile">重载</el-button>
            </el-form-item>
          </el-form>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="邮箱管理" name="emails">
        <SectionCard title="邮箱列表">
          <div class="flex-row">
            <el-input v-model="newEmail" placeholder="添加邮箱" style="max-width:240px" />
            <el-button type="primary" @click="addEmail" :disabled="!newEmail">添加</el-button>
          </div>
          <el-table :data="emails" size="small" style="margin-top:10px">
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="verified" label="已验证" width="90">
              <template #default="{ row }">
                <el-tag :type="row.verified ? 'success':'warning'">{{ row.verified ? '是':'否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="removeEmail(row.emailId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="手机号管理" name="phones">
        <SectionCard title="手机号列表">
          <div class="flex-row">
            <el-input v-model="newPhone" placeholder="添加手机号" style="max-width:240px" />
            <el-button type="primary" @click="addPhone" :disabled="!newPhone">添加</el-button>
          </div>
          <el-table :data="phones" size="small" style="margin-top:10px">
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="verified" label="已验证" width="90">
              <template #default="{ row }">
                <el-tag :type="row.verified ? 'success':'warning'">{{ row.verified ? '是':'否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="removePhone(row.phoneId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="医生/机构" name="providers">
        <SectionCard title="关联的医疗提供者">
          <div class="flex-row">
            <el-input v-model="newProviderId" placeholder="医疗执照号" style="max-width:240px" />
            <el-button type="primary" @click="linkProvider" :disabled="!newProviderId">关联</el-button>
          </div>
          <el-table :data="providers" size="small" style="margin-top:10px">
            <el-table-column prop="providerName" label="名称" />
            <el-table-column prop="licenseNumber" label="执照号" />
            <el-table-column prop="verified" label="已验证" width="90">
              <template #default="{ row }">
                <el-tag :type="row.verified ? 'success':'danger'">{{ row.verified ? '是':'否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="unlinkProvider(row.linkId)">解除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </SectionCard>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import SectionCard from '../components/SectionCard.vue'
import { useNotificationStore } from '../stores/notificationStore'
export default {
  components:{ SectionCard },
  setup() {
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const activeTab = ref('profile')
    const profileForm = ref(null)
    const saving = ref(false)
    const profile = reactive({ name:'', primaryEmail:'', phone:'' })
    const newEmail = ref('')
    const newPhone = ref('')
    const newProviderId = ref('')
    const emails = ref([])
    const phones = ref([])
    const providers = ref([])
    const profileRules = { name:[{required:true,message:'必填',trigger:'blur'}] }
    const reloadProfile = async () => {
      if(!userStore.user?.userId) return
      await userStore.loadUser(userStore.user.userId)
      Object.assign(profile,{ name:userStore.user.name||'', primaryEmail:userStore.user.primaryEmail||'', phone:userStore.user.phone||'' })
      emails.value = userStore.emails
      phones.value = userStore.phones
      providers.value = userStore.providers
    }
    const saveProfile = () => {
      profileForm.value.validate(async valid => {
        if(!valid) return
        saving.value=true
        try { await userStore.updateUser({ name:profile.name, primaryEmail:profile.primaryEmail, phone:profile.phone }); ns.push('success','资料已保存') }
        finally { saving.value=false }
      })
    }
    const addEmail = async () => { const added = await userStore.addEmail(newEmail.value); emails.value.push(added); ns.push('success','邮箱已添加'); newEmail.value='' }
    const removeEmail = async (id) => { await userStore.removeEmail(id); emails.value = emails.value.filter(e=>e.emailId!==id); ns.push('info','邮箱已删除') }
    const addPhone = async () => { const added = await userStore.addPhone(newPhone.value); phones.value.push(added); ns.push('success','手机已添加'); newPhone.value='' }
    const removePhone = async (id) => { await userStore.removePhone(id); phones.value = phones.value.filter(p=>p.phoneId!==id); ns.push('info','手机已删除') }
    const linkProvider = async () => { const linked = await userStore.linkProvider(newProviderId.value); providers.value.push(linked); ns.push('success','已关联提供者'); newProviderId.value='' }
    const unlinkProvider = async (linkId) => { await userStore.unlinkProvider(linkId); providers.value = providers.value.filter(p=>p.linkId!==linkId); ns.push('warning','已解除关联') }
    onMounted(reloadProfile)
    return { activeTab, profile, profileRules, profileForm, saveProfile, reloadProfile, saving,
      newEmail, newPhone, newProviderId, emails, phones, providers,
      addEmail, removeEmail, addPhone, removePhone, linkProvider, unlinkProvider }
  }
}
</script>
<style scoped>
.account-tabs { margin-top:10px; }
.flex-row { display:flex; gap:10px; align-items:center; margin-bottom:6px; }
</style>
