<template>
  <div class="spinner" v-if="visible">
    <el-icon class="rotate"><Loading /></el-icon>
    <span v-if="text" class="text">{{ text }}</span>
  </div>
</template>
<script setup>
import { Loading } from '@element-plus/icons-vue'
defineProps({
  visible: { type: Boolean, default: false },
  text: { type: String, default: '' }
})
</script>
<style scoped>
.spinner { display:flex; align-items:center; gap:8px; padding:8px; }
.rotate { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
.text { font-size: 14px; color:#666; }
</style>

