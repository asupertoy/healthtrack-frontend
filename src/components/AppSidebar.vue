<template>
  <aside class="app-sidebar">
    <ul>
      <li v-for="item in menu" :key="item.path">
        <router-link :to="item.path" class="link" :class="{ active: isActive(item.path) }">
          <span class="icon">{{ item.icon || '📌' }}</span>
          <span class="text">{{ item.name }}</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>

<script>
import { useRoute } from 'vue-router'
export default {
  name:'AppSidebar',
  props:{ menu:{ type:Array, default: () => [
    { name:'Dashboard', path:'/dashboard', icon:'🏠' },
    { name:'Account', path:'/account', icon:'👤' },
    { name:'Appointments', path:'/appointments', icon:'🩺' },
    { name:'Challenges', path:'/challenges', icon:'🎯' },
    { name:'Health Records', path:'/records', icon:'📝' },
    { name:'Family Group', path:'/family', icon:'👪' },
    { name:'Search', path:'/search', icon:'🔍' }
  ] } },
  setup(){
    const route = useRoute()
    const isActive = (p) => route.path === p
    return { isActive }
  }
}
</script>

<style scoped>
.app-sidebar {
  width: 230px;
  background: #ffffff;
  border-right: 1px solid #e6e8eb;
  padding: 18px 0;
  display: flex;
  flex-direction: column;
}
ul { list-style:none; margin:0; padding:0; }
li { margin-bottom:4px; }
.link {
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 20px;
  text-decoration:none;
  color:#303133;
  font-size:14px;
  border-left:4px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.link:hover {
  background:#f3f7fd;
}
.link.active {
  background:#e6f0ff;
  border-left-color:#409EFF;
  font-weight:600;
  color:#1f2d3d;
}
.icon { width:20px; text-align:center; }
@media (max-width:860px){
  .app-sidebar {
    flex-direction:row;
    width:auto;
    height:auto;
    border-right:none;
    border-bottom:1px solid #e6e8eb;
    overflow-x:auto;
  }
  ul { display:flex; }
  li { margin:0; }
  .link { padding:10px 14px; }
}
</style>
