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
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: var(--ht-shadow, 0 10px 30px rgba(31, 45, 61, 0.08));
}
:deep(.el-card__header) {
  background: linear-gradient(135deg, #f7faff, #eff3ff);
  border-bottom: 1px solid var(--ht-border, #e6e8eb);
}
:deep(.el-card__body) {
  padding: 20px 24px;
  background: #fff;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--ht-text-main, #303133);
}
</style>
