<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="header">HealthTrack 登录</div>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top" @submit.prevent>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" autocomplete="username" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" placeholder="请输入密码"></el-input>
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
    const form = reactive({ email: '', password: '' })
    const rules = {
      email: [ { required:true, message:'邮箱必填', trigger:'blur' }, { type:'email', message:'格式不正确', trigger:['blur','change'] } ],
      password: [ { required:true, message:'密码必填', trigger:'blur' }, { min:6, message:'至少6位', trigger:'blur' } ]
    }
    const error = ref(null)
    const loading = ref(false)
    const reset = () => { form.email=''; form.password=''; error.value=null }
    const handleLogin = () => {
      formRef.value.validate(async valid => {
        if(!valid) return
        error.value=null
        loading.value=true
        try {
          await userStore.login(form.email, form.password)
          router.push('/dashboard')
        } catch(e) {
          error.value = e.message || '登录失败'
        } finally { loading.value=false }
      })
    }
    return { form, rules, formRef, error, loading, handleLogin, reset }
  }
}
</script>

<style scoped>
.login-container { display:flex; justify-content:center; align-items:center; height:100vh; background:linear-gradient(135deg,#f0f7ff,#d9ecff); }
.login-card { width:400px; }
.header { font-size:18px; font-weight:600; }
.error-alert { margin-top:10px; }
</style>
