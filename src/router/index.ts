/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHashHistory } from 'vue-router'
import Index from '@/pages/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Index,
    },
    {
      path: '/todos',
      name: 'todos',
      component: Index,
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: Index,
    },
    {
      path: '/family',
      name: 'family',
      component: Index,
    },
    {
      path: '/recurring',
      name: 'recurring',
      component: Index,
    },
    {
      path: '/guests',
      name: 'guests',
      component: Index,
    },
    {
      path: '/shopping',
      name: 'shopping',
      component: Index,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

export default router

