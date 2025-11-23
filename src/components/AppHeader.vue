<template>
  <header class="app-header">
    <div class="logo">HealthTrack</div>
    <div class="user-info">
      <span>{{ userName }}</span>
      <button @click="$emit('logout')">退出</button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    userName: {
      type: String,
      default: 'Guest'
    }
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #409EFF;
  color: #fff;
}
.logo {
  font-size: 20px;
  font-weight: bold;
}
.user-info button {
  margin-left: 10px;
  padding: 4px 8px;
  border: none;
  background-color: #fff;
  color: #409EFF;
  cursor: pointer;
  border-radius: 4px;
}
</style>
