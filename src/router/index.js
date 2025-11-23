import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Account from '../views/Account.vue'
import Appointments from '../views/Appointments.vue'
import Challenges from '../views/Challenges.vue'
import MonthlySummary from '../views/MonthlySummary.vue'
import Search from '../views/Search.vue'
import FamilyGroup from '../views/FamilyGroup.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard },
    { path: '/account', name: 'Account', component: Account },
    { path: '/appointments', name: 'Appointments', component: Appointments },
    { path: '/challenges', name: 'Challenges', component: Challenges },
    { path: '/monthly-summary', name: 'MonthlySummary', component: MonthlySummary },
    { path: '/search', name: 'Search', component: Search },
    { path: '/family', name: 'FamilyGroup', component: FamilyGroup }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
