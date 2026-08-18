import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Ingresar', public: true },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Panel', requiresAuth: true },
  },
  {
    path: '/solicitudes',
    name: 'Requests',
    component: () => import('@/views/RequestsView.vue'),
    meta: { title: 'Solicitudes', requiresAuth: true },
  },
  {
    path: '/solicitudes/:id',
    name: 'RequestDetail',
    component: () => import('@/views/RequestDetailView.vue'),
    meta: { title: 'Solicitud', requiresAuth: true },
  },
  {
    path: '/horas',
    name: 'Time',
    component: () => import('@/views/TimeView.vue'),
    meta: { title: 'Horas', requiresAuth: true },
  },
  {
    path: '/reportes',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: { title: 'Reportes', requiresAuth: true },
  },
  {
    path: '/metricas',
    name: 'Metrics',
    component: () => import('@/views/MetricsView.vue'),
    meta: { title: 'Métricas', requiresAuth: true },
  },
  {
    path: '/equipo',
    name: 'Team',
    component: () => import('@/views/TeamView.vue'),
    meta: { title: 'Equipo', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/perfil',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: 'Mi perfil', requiresAuth: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  const hasToken = !!localStorage.getItem('access_token')

  if (hasToken && !userStore.user) await userStore.hydrate()

  document.title = `${to.meta.title || 'Panel'} · PHB Develop Time`

  if (to.meta.requiresAuth && !userStore.isAuthenticated) return { path: '/login' }
  if (to.path === '/login' && userStore.isAuthenticated) return { path: '/' }

  const roles = to.meta.roles as string[] | undefined
  if (roles && userStore.user && !roles.includes(userStore.user.role)) return { path: '/' }

  return true
})

export default router
