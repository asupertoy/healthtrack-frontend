<template>
  <div class="register-container">
    <el-card class="register-card" shadow="always">
      <template #header>
        <div class="header">注册 HealthTrack 账户</div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" @submit.prevent>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="用户唯一健康ID (health_id)" prop="healthId">
          <el-input v-model="form.healthId" placeholder="例如 HLT2001" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <!-- 新增密码字段 -->
        <el-form-item label="登录密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请设置登录密码（至少6位）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister" class="register-btn">注册</el-button>
        </el-form-item>
        <div class="footer-links">
          <el-button type="text" @click="goLogin">已有账号？去登录</el-button>
        </div>
        <el-alert v-if="error" :title="error" type="error" show-icon class="error-alert" />
        <el-alert v-if="success" :title="success" type="success" show-icon class="success-alert" />
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import authApi from '../api/authApi'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const formRef = ref(null)
    const form = reactive({
      name: '',
      healthId: '', // 作为 user-id / healthId
      email: '',
      phone: '',
      password: '',
    })
    const rules = {
      name: [{ required: true, message: '姓名必填', trigger: 'blur' }],
      healthId: [{ required: true, message: '用户唯一ID必填', trigger: 'blur' }],
      email: [
        { required: true, message: '邮箱必填', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
      ],
      phone: [{ required: true, message: '手机号必填', trigger: 'blur' }],
      password: [
        { required: true, message: '密码必填', trigger: 'blur' },
        { min: 6, message: '至少6位', trigger: 'blur' },
      ],
    }
    const loading = ref(false)
    const error = ref(null)
    const success = ref(null)

    const handleRegister = () => {
      formRef.value.validate(async valid => {
        if (!valid) return
        error.value = null
        success.value = null
        loading.value = true
        try {
          // 1）调用后端统一注册接口 /api/auth/register
          await authApi.register({
            healthId: form.healthId,
            name: form.name,
            phone: form.phone,
            email: form.email,
            password: form.password,
          })

          // 2）自动登录：优先用邮箱登录，否则用手机号
          const identifier = form.email || form.phone
          if (!identifier) {
            success.value = '注册成功，请使用账号登录'
            setTimeout(() => router.push('/login'), 800)
            return
          }

          await userStore.login(identifier, form.password)

          success.value = '注册并登录成功，正在进入首页...'
          // 3）跳转到业务首页（Dashboard）
          setTimeout(() => {
            router.push('/dashboard')
          }, 500)
        } catch (e) {
          error.value = e?.response?.data?.message || e.message || '注册失败'
        } finally {
          loading.value = false
        }
      })
    }

    const goLogin = () => {
      router.push('/login')
    }

    return { form, rules, formRef, loading, error, success, handleRegister, goLogin }
  },
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f0f7ff, #d9ecff);
}
.register-card {
  width: 420px;
  border-radius: 12px;
}
.header {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: #303133;
}
.register-btn {
  width: 100%;
}
.footer-links {
  text-align: center;
  margin-top: 10px;
}
.error-alert,
.success-alert {
  margin-top: 15px;
}
</style>
