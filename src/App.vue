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
body {
  margin: 0;
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  background: #f3f5f9;
  color: #303133;
}
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.body {
  flex: 1;
  display: flex;
  background: linear-gradient(135deg, #f5f7fa 0%, #edf1f7 50%, #f5f7fa 100%);
}
.content {
  flex: 1;
  padding: 20px 28px 32px;
  overflow: auto;
  background: transparent;
}
.content > * {
  max-width: 1180px;
  margin: 0 auto;
}
@media (max-width: 860px) {
  .body {
    flex-direction: column;
    min-height: 100vh;
    background: #f7f8fc;
  }
  .content {
    padding: 16px;
  }
  /* 登录 / 注册 页使用渐变背景，子内容居中 */
  .body .content > * {
    max-width: 460px;
  }
}
html, body, #app {
  min-height: 100vh;
}
/* 登录/注册 单独背景需要撑满 */
#app .body .content {
  display: flex;
  justify-content: center;
  align-items: center;
}
@media (min-width: 861px) {
  #app .body .content > * {
    width: 100%;
  }
}
</style>
