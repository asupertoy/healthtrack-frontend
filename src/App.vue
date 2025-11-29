<template>
  <div id="app" class="layout">
    <AppHeader :userName="userName" @logout="handleLogout" />
    <div class="body">
      <AppSidebar v-if="isLoggedIn" />
      <main class="content">
        <router-view />
      </main>
    </div>
    <AppToasts />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from './stores/userStore'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppToasts from './components/AppToasts.vue'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const isLoggedIn = computed(() => !!userStore.user)
const userName = computed(() => userStore.user?.name || 'Guest')
const handleLogout = () => {
  userStore.user = null
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style>
body { margin:0; font-family:"Segoe UI", Arial, sans-serif; background:#f6f9fc; }
.layout { display:flex; flex-direction:column; height:100vh; }
.body { flex:1; display:flex; }
.content { flex:1; padding:20px 28px; overflow:auto; background:#fff; box-shadow:inset 0 0 0 1px #ebeef5; }
@media (max-width: 860px){ .body { flex-direction:column; } }
</style>
