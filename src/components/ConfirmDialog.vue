<template>
  <el-dialog
      :visible.sync="visible"
      width="400px"
      :before-close="handleClose"
  >
    <p>{{ message }}</p>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    visible: Boolean,
    message: String
  },
  emits: ['update:visible', 'confirm', 'cancel'],
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
