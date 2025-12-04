<template>
  <div>
    <el-page-header content="账户信息" />
    <el-tabs v-model="activeTab" class="account-tabs">
      <el-tab-pane label="基本资料" name="profile">
        <SectionCard title="基本资料">
          <el-form :model="profile" label-width="100px" :rules="profileRules" ref="profileForm">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profile.name" :disabled="!editingProfile" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="出生日期" prop="dateOfBirth">
              <el-date-picker v-model="profile.dateOfBirth" type="date" value-format="YYYY-MM-DD" :disabled="!editingProfile" placeholder="选择出生日期" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profile.phone" :disabled="true" placeholder="手机号（请在手机号管理中修改）" />
            </el-form-item>
            <el-form-item>
              <template v-if="!editingProfile">
                <el-button type="primary" @click="startEdit">修改</el-button>
                <el-button @click="reloadProfile">刷新</el-button>
              </template>
              <template v-else>
                <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </template>
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
            <!-- 显示后端返回的 emailAddress 字段 -->
            <el-table-column prop="emailAddress" label="邮箱" />
            <el-table-column prop="verified" label="已验证" width="90">
              <template #default="{ row }">
                <el-tag :type="row.verified ? 'success':'warning'">{{ row.verified ? '是':'否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" :loading="deletingEmailId === (row.emailId || row.id)" @click="removeEmail(row.emailId || row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="手机号管理" name="phones">
        <SectionCard title="手机号列表">
          <!-- 编辑区域：当有 editingPhoneId 时显示输入框和保存/取消 -->
          <div v-if="editingPhoneId" class="flex-row" style="margin-bottom:8px">
            <el-input v-model="newPhone" placeholder="输入新的手机号" style="max-width:240px" />
            <el-button type="primary" @click="savePhone" :loading="savingPhone">保存</el-button>
            <el-button @click="cancelEditPhone">取消</el-button>
          </div>
          <el-table :data="phones" size="small" style="margin-top:10px">
            <el-table-column prop="phoneNumber" label="手机号">
              <template #default="{ row }">{{ row.phoneNumber || row.phone }}</template>
            </el-table-column>
            <el-table-column prop="verified" label="已验证" width="90">
              <template #default="{ row }">
                <el-tag :type="row.verified ? 'success' : 'warning'">
                  {{ row.verified ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button type="primary" size="small" :loading="editingPhoneId === (row.phoneId || row.id)" @click="editPhone(row)">修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </SectionCard>
      </el-tab-pane>
      <el-tab-pane label="医生/机构" name="providers">
        <SectionCard title="关联的医疗提供者">
          <div class="flex-row">
            <el-select v-model="newProviderId" placeholder="选择要关联的医生" style="max-width:320px">
              <el-option v-for="p in unlinkedProviders" :key="p.providerId" :label="`${p.name} (ID:${p.providerId})`" :value="p.providerId" />
            </el-select>
            <el-button type="primary" @click="linkProvider" :disabled="!newProviderId">关联</el-button>
          </div>
          <el-table :data="displayedProviders" size="small" style="margin-top:10px">
            <!-- 如果是 provider-link DTO，可能包含 provider.name / provider.licenseNumber -->
            <el-table-column label="名称">
              <template #default="{ row }">{{ row.providerName || row.provider?.name || row.providerId || '-' }}</template>
            </el-table-column>
            <el-table-column label="执照号">
              <template #default="{ row }">{{ row.licenseNumber || row.provider?.licenseNumber || '-' }}</template>
            </el-table-column>
            <el-table-column label="主医生" width="90">
              <template #default="{ row }">
                <el-tag :type="row.isPrimary ? 'success' : 'info'">{{ row.isPrimary ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="verified" label="已验证" width="90">
              <template #default="{ row }">
                <el-tag :type="row.verified ? 'success':'danger'">{{ row.verified ? '是':'否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="danger" size="small" @click="unlinkProvider(row.linkId || row.id)">解除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 当 providers 为空时，显示提示信息 -->
          <div v-if="displayedProviders.length === 0" style="margin-top:10px; color:#999">
            目前没有关联的医疗提供者
            <el-button type="text" @click="fetchProviderLinks" style="margin-left:8px">重新加载关联</el-button>
            <el-button type="text" @click="rawProvidersVisible = !rawProvidersVisible" style="margin-left:8px">显示原始数据</el-button>
            <pre v-if="rawProvidersVisible" style="background:#f7f7f7;padding:10px;margin-top:8px;white-space:pre-wrap;">{{ JSON.stringify(userStore.providers || [], null, 2) }}</pre>
          </div>
        </SectionCard>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import SectionCard from '../components/SectionCard.vue'
import { useNotificationStore } from '../stores/notificationStore'
import providerApi from '../api/providerApi'
import { ElMessageBox } from 'element-plus'

export default {
  components: { SectionCard },
  setup() {
    const deletingEmailId = ref(null)
    const deletingPhoneId = ref(null)
    const userStore = useUserStore()
    const ns = useNotificationStore()
    const activeTab = ref('profile')
    const profileForm = ref(null)
    const saving = ref(false)
    const profile = reactive({ name: '', primaryEmail: '', phone: '', dateOfBirth: null })
    const newEmail = ref('')
    const newPhone = ref('')
    const newProviderId = ref('')
    const allProviders = ref([])
    const emails = ref([])
    const phones = ref([])
    const providers = ref([])
    const providerDetailsCache = ref({})
    const editingProfile = ref(false)
    const editingPhoneId = ref(null)
    const savingPhone = ref(false)
    // If store already has provider-links (populated before this component mounts), show them immediately
    if (userStore.providers && userStore.providers.length) {
      providers.value = userStore.providers.slice()
    }
    const profileRules = { name: [{ required: true, message: '必填', trigger: 'blur' }] }
    const rawProvidersVisible = ref(false)

    const enrichProviderLinks = async rawLinks => {
      const result = []
      for (const link of rawLinks || []) {
        const providerId = link.providerId || link.provider?.providerId
        let providerDetail = providerDetailsCache.value[providerId]
        if (providerId && !providerDetail) {
          try {
            providerDetail = await providerApi.getProviderById(providerId)
            providerDetailsCache.value[providerId] = providerDetail
          } catch (e) {
            ns.push('error', e?.response?.data?.message || e.message || `加载医生信息失败(ID=${providerId})`)
          }
        }
        result.push({
          ...link,
          providerName: providerDetail?.name || link.providerName,
          licenseNumber: providerDetail?.licenseNumber || link.licenseNumber,
          verified: providerDetail?.verified ?? link.verified,
          // normalize isPrimary from different possible shapes
          isPrimary: link.isPrimary ?? link.is_primary ?? link.provider?.isPrimary ?? false,
        })
      }
      return result
    }

    const reloadProfile = async () => {
      try {
        // 如果还没有 user，则尝试从后端恢复当前用户信息
        if (!userStore.user && userStore.userId) {
          await userStore.restoreSession()
        }
        if (!userStore.user) return
        Object.assign(profile, {
          name: userStore.user.name || '',
          primaryEmail: userStore.user.primaryEmail || userStore.user.email || '',
          phone: userStore.user.phone || '',
          // keep dateOfBirth as server string (YYYY-MM-DD) to match date-picker value-format
          dateOfBirth: userStore.user.dateOfBirth || null,
        })
        // 使用 store 中的列表作为单一数据源，确保已有数据展示出来
        emails.value = [...(userStore.emails || [])]
        phones.value = [...(userStore.phones || [])]
        // 确保 provider-links 被加载并显示（自动调用 fetchProviderLinks）
        await fetchProviderLinks()
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '加载账户信息失败')
      }
    }

    const startEdit = () => {
      editingProfile.value = true
    }

    const cancelEdit = () => {
      editingProfile.value = false
      // 重新加载以丢弃未保存的更改
      reloadProfile()
    }

    const onSave = () => {
      profileForm.value.validate(async valid => {
        if (!valid) return
        // Build a safe payload: only allow name and dateOfBirth updates from this form
        const original = userStore.user || {}
        const payload = {}
        if (profile.name !== (original.name || '')) payload.name = profile.name
        if (profile.dateOfBirth !== undefined && profile.dateOfBirth !== (original.dateOfBirth || '')) payload.dateOfBirth = profile.dateOfBirth || null

        if (Object.keys(payload).length === 0) {
          ns.push('info', '未修改任何资料')
          return
        }

        saving.value = true
        try {
          await userStore.updateUser(payload)
          ns.push('success', '资料已保存')
          // Reload profile to pick up any server-side normalization
          await reloadProfile()
          editingProfile.value = false
        } catch (err) {
          ns.push('error', err?.response?.data?.message || err.message || '保存失败')
        } finally {
          saving.value = false
        }
      })
    }

    const addEmail = async () => {
      const added = await userStore.addEmail(newEmail.value)
      emails.value.push(added)
      ns.push('success', '邮箱已添加')
      newEmail.value = ''
    }

    const removeEmail = async id => {
      try {
        await ElMessageBox.confirm('确定要删除该邮箱吗？该操作不可撤销。', '删除确认', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        })
      } catch (e) {
        // user cancelled
        return
      }
      deletingEmailId.value = id
      try {
        await userStore.removeEmail(id)
        emails.value = emails.value.filter(e => (e.emailId || e.id) !== id)
        ns.push('info', '邮箱已删除')
      } catch (err) {
        console.error('删除邮箱失败', err)
        ns.push('error', err?.response?.data?.message || err.message || '删除失败')
      } finally {
        deletingEmailId.value = null
      }
    }

    const editPhone = async row => {
      // 直接将手机号填入 newPhone 以便于保存
      newPhone.value = row.phoneNumber || row.phone
      editingPhoneId.value = row.phoneId || row.id
    }

    const savePhone = async () => {
      if (!editingPhoneId.value) return
      const phoneNumber = newPhone.value
      savingPhone.value = true
      try {
        // 调用 userStore.updatePhone，传入完整的 phone 对象
        const updated = await userStore.updatePhone({ id: editingPhoneId.value, phoneNumber })
        // 更新本地 phones 列表
        const index = phones.value.findIndex(p => (p.phoneId || p.id) === editingPhoneId.value)
        if (index !== -1) {
          phones.value[index] = updated
          ns.push('success', '手机号已更新')
        } else {
          ns.push('warning', '未找到要更新的手机号')
        }
      } catch (err) {
        ns.push('error', err?.response?.data?.message || err.message || '更新手机号失败')
      } finally {
        // 退出编辑状态
        editingPhoneId.value = null
        newPhone.value = ''
        savingPhone.value = false
      }
    }

    const cancelEditPhone = () => {
      editingPhoneId.value = null
      newPhone.value = ''
    }

    const linkProvider = async () => {
      const linked = await userStore.linkProvider(newProviderId.value)
      const enriched = await enrichProviderLinks([linked])
      providers.value.push(enriched[0])
      ns.push('success', '已关联提供者')
      newProviderId.value = ''
    }

    const unlinkProvider = async linkId => {
      await userStore.unlinkProvider(linkId)
      providers.value = providers.value.filter(p => (p.linkId || p.id) !== linkId)
      ns.push('warning', '已解除关联')
    }

    const fetchProviderLinks = async () => {
      try {
        const links = await userStore.fetchProviderLinks()
        providers.value = await enrichProviderLinks(links)
        ns.push('success', '关联提供者已更新')
      } catch (e) {
        ns.push('error', e?.response?.data?.message || e.message || '加载关联提供者失败')
      }
    }

    const fetchAllProviders = async () => {
      try {
        allProviders.value = await providerApi.getProviders()
      } catch (e) {
        console.debug('无法获取 providers 列表', e)
        allProviders.value = []
      }
    }

    const displayedProviders = computed(() => {
      const enriched = providers.value
      if (enriched && enriched.length) return enriched
      const storeLinks = userStore.providers || []
      // map storeLinks to ensure providerName/providerId present and normalize isPrimary
      return storeLinks.map(l => ({
        ...l,
        providerName: l.providerName || l.provider?.name || null,
        // support possible variants: isPrimary / is_primary
        isPrimary: l.isPrimary ?? l.is_primary ?? l.provider?.isPrimary ?? false,
      }))
    })

    const unlinkedProviders = computed(() => {
      const linkedIds = new Set((userStore.providers || []).map(l => l.providerId || l.provider?.providerId))
      return (allProviders.value || []).filter(p => !linkedIds.has(p.providerId))
    })

    // If the store's providers change after component mounted (e.g. restored later), keep UI in sync
    watch(() => userStore.providers, (newLinks) => {
      try {
        const raw = newLinks || []
        // show raw immediately
        providers.value = raw.slice()
        // then enrich in background
        enrichProviderLinks(raw).then(enriched => {
          providers.value = enriched
          console.debug('watch: updated providers from store (enriched)', providers.value)
        }).catch(e => console.error('watch: failed to enrich provider links', e))
      } catch (e) {
        console.error('watch: failed to process provider links', e)
      }
    }, { immediate: true, deep: true })

    onMounted(async () => { await Promise.all([reloadProfile(), fetchAllProviders()]) })

    return {
      activeTab,
      profile,
      profileRules,
      profileForm,
      reloadProfile,
      saving,
      newEmail,
      newPhone,
      newProviderId,
      unlinkedProviders,
      allProviders,
      emails,
      phones,
      providers,
      displayedProviders,
      addEmail,
      removeEmail,
      editPhone,
      savePhone,
      cancelEditPhone,
      linkProvider,
      unlinkProvider,
      fetchProviderLinks,
      rawProvidersVisible,
      userStore,
      editingProfile,
      startEdit,
      cancelEdit,
      onSave,
      deletingEmailId,
      deletingPhoneId,
      editingPhoneId,
    }
  },
}
</script>
<style scoped>
.account-tabs { margin-top:10px; }
.flex-row { display:flex; gap:10px; align-items:center; margin-bottom:6px; }
</style>
