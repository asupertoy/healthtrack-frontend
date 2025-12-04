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
.section-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}
:deep(.el-card__body) {
  padding: 16px 20px 18px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}
</style>
