<template>
  <el-dialog
      v-model="internalVisible"
      width="400px"
  >
    <p>{{ message }}</p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    modelValue: { // use v-model for external control
      type: Boolean,
      default: false
    },
    message: String
  },
  emits: ['update:modelValue', 'confirm', 'cancel'],
  computed: {
    internalVisible: {
      get() { return this.modelValue },
      set(val) { this.$emit('update:modelValue', val) }
    }
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:modelValue', false)
    },
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('update:modelValue', false)
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
