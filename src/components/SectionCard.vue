<template>
  <el-card class="section-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>{{ title }}</span>
        <slot name="actions"></slot>
      </div>
    </template>
    <slot></slot>
  </el-card>
</template>
<script setup>
defineProps({ title: { type:String, default:'' } })
</script>
<style scoped>
.section-card { margin-bottom:20px; }
.card-header { display:flex; justify-content:space-between; align-items:center; font-weight:600; }
</style>

