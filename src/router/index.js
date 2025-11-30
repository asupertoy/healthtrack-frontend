import { createRouter, createWebHistory } from 'vue-router'

// Lazy-loaded route components
const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/account', name: 'Account', component: () => import('../views/Account.vue') },
  { path: '/appointments', name: 'Appointments', component: () => import('../views/Appointments.vue') },
  { path: '/challenges', name: 'Challenges', component: () => import('../views/Challenges.vue') },
  { path: '/monthly-summary', name: 'MonthlySummary', component: () => import('../views/MonthlySummary.vue') },
  { path: '/search', name: 'Search', component: () => import('../views/Search.vue') },
  { path: '/family', name: 'FamilyGroup', component: () => import('../views/FamilyGroup.vue') },
  { path: '/records', name: 'HealthRecords', component: () => import('../views/HealthRecords.vue') },
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/Dashboard.vue') } // simple fallback
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simple auth guard: if no token and not on /login or /register, redirect to login
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login' && to.path !== '/register') return next('/login')
  next()
})

export default router
