<template>
  <div class="toasts-container" v-if="toasts.length">
    <transition-group name="toast" tag="div">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type" @click="remove(t.id)">
        <strong>{{ mapType(t.type) }}</strong> {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notificationStore'
const ns = useNotificationStore()
const { toasts } = storeToRefs(ns)
const remove = (id) => ns.remove(id)
const mapType = (type) => ({ success:'成功', error:'错误', info:'提示', warning:'警告' }[type] || '')
</script>
<style scoped>
.toasts-container { position: fixed; top:70px; right:20px; z-index:2000; display:flex; flex-direction:column; gap:8px; }
.toast { padding:10px 14px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.15); font-size:14px; cursor:pointer; background:#fff; border-left:5px solid var(--color,#409EFF); }
.toast.success { --color:#67C23A; }
.toast.error { --color:#F56C6C; }
.toast.info { --color:#409EFF; }
.toast.warning { --color:#E6A23C; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from { opacity:0; transform:translateX(40px); }
.toast-leave-to { opacity:0; transform:translateX(40px); }
</style>

