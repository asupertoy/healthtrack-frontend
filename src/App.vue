<template>
  <div id="app" class="layout">
    <AppHeader :userName="userName" @logout="handleLogout" />
    <div class="body">
      <AppSidebar v-if="isLoggedIn" />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from './stores/userStore'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const isLoggedIn = computed(() => !!userStore.user)
const userName = computed(() => userStore.user?.name || 'Guest')
const handleLogout = () => {
  userStore.user = null
  router.push('/login')
}
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.body {
  flex: 1;
  display: flex;
}
.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}
</style>
