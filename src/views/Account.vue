<template>
  <div>
    <h2>Account Information</h2>
    <form @submit.prevent="updateAccount">
      <div>
        <label>Name:</label>
        <input v-model="account.name" placeholder="Full Name" required/>
      </div>
      <div>
        <label>Email:</label>
        <input v-model="account.email" placeholder="Email"/>
      </div>
      <div>
        <label>Phone:</label>
        <input v-model="account.phone" placeholder="Phone Number"/>
      </div>
      <button type="submit">Update</button>
    </form>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'
export default {
  setup() {
    const userStore = useUserStore()
    const account = reactive({ name: '', email: '', phone: '' })
    const updateAccount = async () => {
      await userStore.updateUser(account)
      alert('Account updated!')
    }
    onMounted(async () => {
      Object.assign(account, await userStore.fetchUser())
    })
    return { account, updateAccount }
  }
}
</script>
