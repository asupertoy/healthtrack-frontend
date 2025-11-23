<template>
  <div class="login-page">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="Username" required/>
      <input type="password" v-model="password" placeholder="Password" required/>
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
export default {
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const error = ref(null)
    const handleLogin = async () => {
      try {
        await userStore.login(username.value, password.value)
        router.push('/dashboard')
      } catch(e) {
        error.value = e.message
      }
    }
    return { username, password, error, handleLogin }
  }
}
</script>
