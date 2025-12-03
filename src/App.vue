<template>
  <div id="app" class="layout">
    <!-- 仅在非登录/注册页显示头部和侧边栏 -->
    <template v-if="!isAuthRoute">
      <AppHeader :userName="userName" @logout="handleLogout" />
      <div class="body">
        <AppSidebar v-if="isLoggedIn" />
        <main class="content">
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <!-- 登录 / 注册 页：只显示内容区域，不显示头部和侧边栏 -->
      <div class="body">
        <main class="content">
          <router-view />
        </main>
      </div>
    </template>
    <AppToasts />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppToasts from './components/AppToasts.vue'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 当前是否在登录/注册页
const isAuthRoute = computed(() => route.path === '/login' || route.path === '/register')
// 根据 accessToken 判断是否登录，这样刷新后仍显示侧边栏
const isLoggedIn = computed(() => !!userStore.accessToken)
const userName = computed(() => userStore.user?.name || 'Guest')

// 应用启动时尝试恢复用户信息
onMounted(async () => {
  if (userStore.userId && !userStore.user) {
    try {
      await userStore.restoreSession()
    } catch (e) {
      // 如果恢复失败，可以选择跳回登录页或忽略
      // router.push('/login')
    }
  }
})

const handleLogout = () => {
  userStore.logout()
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
