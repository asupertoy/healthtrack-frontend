<template>
  <header class="app-header">
    <div class="left">
      <div class="logo">HealthTrack</div>
      <span class="tagline">Personal Wellness Platform</span>
    </div>
    <div class="right">
      <div class="avatar">{{ (userName||'G').charAt(0).toUpperCase() }}</div>
      <span class="username">{{ userName }}</span>
      <el-button size="small" @click="$emit('logout')" type="danger">退出</el-button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: { userName: { type:String, default:'Guest' } }
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background: linear-gradient(120deg, #409EFF, #66b1ff);
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .08);
}
.left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: .5px;
}
.tagline {
  font-size: 12px;
  opacity: .9;
}
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fff;
  color: #409EFF;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, .4);
}
.username {
  font-weight: 600;
}
</style>
