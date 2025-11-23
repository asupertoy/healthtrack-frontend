<template>
  <aside class="app-sidebar">
    <ul>
      <li v-for="item in menu" :key="item.path">
        <router-link :to="item.path">{{ item.name }}</router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: {
    menu: {
      type: Array,
      default: () => [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Account', path: '/account' },
        { name: 'Appointments', path: '/appointments' },
        { name: 'Challenges', path: '/challenges' },
        { name: 'Monthly Summary', path: '/monthly-summary' },
        { name: 'Family Group', path: '/family-group' },
        { name: 'Search', path: '/search' }
      ]
    }
  }
}
</script>

<style scoped>
.app-sidebar {
  width: 200px;
  height: 100vh;
  background-color: #f5f7fa;
  padding-top: 20px;
}
.app-sidebar ul {
  list-style: none;
  padding: 0;
}
.app-sidebar li {
  margin-bottom: 10px;
}
.app-sidebar a {
  text-decoration: none;
  color: #333;
  display: block;
  padding: 8px 20px;
  border-radius: 4px;
}
.app-sidebar a:hover {
  background-color: #e6f0ff;
}
</style>
