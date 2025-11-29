<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="header">HealthTrack 登录</div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" @submit.prevent>
        <!-- 支持邮箱或手机号 -->
        <el-form-item label="邮箱或手机号" prop="identifier">
          <el-input
            v-model="form.identifier"
            autocomplete="username"
            placeholder="请输入邮箱或手机号"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin">登录</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
        <el-alert v-if="error" :title="error" type="error" show-icon class="error-alert" />
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const formRef = ref(null)
    const form = reactive({ identifier: '', password: '' })
    const rules = {
      identifier: [
        { required: true, message: '邮箱或手机号必填', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '密码必填', trigger: 'blur' },
        { min: 6, message: '至少6位', trigger: 'blur' },
      ],
    }
    const error = ref(null)
    const loading = ref(false)

    const reset = () => {
      form.identifier = ''
      form.password = ''
      error.value = null
    }

    const handleLogin = () => {
      formRef.value.validate(async valid => {
        if (!valid) return
        error.value = null
        loading.value = true
        try {
          await userStore.login(form.identifier, form.password)
          router.push('/dashboard')
        } catch (e) {
          // Network Error 或后端报错
          error.value = e?.response?.data?.message || e.message || '登录失败'
        } finally {
          loading.value = false
        }
      })
    }

    return { form, rules, formRef, error, loading, handleLogin, reset }
  },
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f0f7ff, #d9ecff);
}
.login-card {
  width: 400px;
}
.header {
  font-size: 18px;
  font-weight: 600;
}
.error-alert {
  margin-top: 10px;
}
</style>
