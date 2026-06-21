import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'

const routes = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/scenes', name: 'SceneSelection', component: () => import('@/views/SceneSelection.vue') },
  { path: '/focus', name: 'FocusPage', component: () => import('@/views/FocusPage.vue') },
  { path: '/history', name: 'History', component: () => import('@/views/HistoryPage.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
