<template>
  <div>
    <h2>Dashboard</h2>
    <nav>
      <router-link to="/account">Account</router-link> |
      <router-link to="/appointments">Appointments</router-link> |
      <router-link to="/challenges">Challenges</router-link> |
      <router-link to="/monthly-summary">Monthly Summary</router-link> |
      <router-link to="/search">Search</router-link> |
      <router-link to="/family">Family</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default { name: 'Dashboard' }
</script>
