<template>
  <div>
    <h2>Family Groups</h2>
    <ul>
      <li v-for="group in groups" :key="group.id">
        {{ group.name }} - Members: {{ group.members.length }}
      </li>
    </ul>
    <div>
      <input v-model="newGroupName" placeholder="New Group Name"/>
      <button @click="createGroup">Create Group</button>
    </div>
  </div>
</template>

<script>
import { useFamilyStore } from '../stores/familyStore'
export default {
  setup() {
    const familyStore = useFamilyStore()
    const groups = ref([])
    const newGroupName = ref('')
    const fetchGroups = async () => {
      groups.value = await familyStore.fetchGroups()
    }
    const createGroup = async () => {
      if(!newGroupName.value) return
      await familyStore.createGroup({ name: newGroupName.value })
      newGroupName.value = ''
      fetchGroups()
    }
    onMounted(fetchGroups)
    return { groups, newGroupName, fetchGroups, createGroup }
  }
}
</script>
