import { createRouter, createWebHistory } from 'vue-router'
import AttackView from '../views/AttackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'attack',
      component: AttackView
    },
    {
      path: '/insights',
      name: 'insights',
      // Lazy-loaded when this route is visited.
      component: () => import('../views/InsightsView.vue')
    },
    {
      path: '/magma',
      name: 'magma',
      // Lazy-loaded when this route is visited.
      component: () => import('../views/MagmaView.vue')
    },
  ]
})

export default router
