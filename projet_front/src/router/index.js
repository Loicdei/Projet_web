import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CompanyView from '../views/CompanyView.vue'
import AssetsView from '../views/AssetsView.vue'
import DashboardView from '../views/DashboardView.vue'
import ReportView from '../views/ReportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/entreprise', name: 'company', component: CompanyView },
    { path: '/actifs', name: 'assets', component: AssetsView },
    { path: '/dashboard', name: 'dashboard', component: DashboardView },
    { path: '/rapport', name: 'report', component: ReportView }
  ]
})

export default router