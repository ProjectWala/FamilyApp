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
      path: '/tags',
      name: 'tags',
      component: Index,
    },
    {
      path: '/gifts',
      name: 'gifts',
      component: Index,
    },
    {
      path: '/login',
      name: 'login',
      component: Index,
    },
    {
      path: '/signup',
      name: 'signup',
      component: Index,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Index,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// Authentication Route Guard: Restrict access to app routes without login
router.beforeEach((to, _from, next) => {
  const isAuth = !!localStorage.getItem('family_app_auth_user')
  const isAuthRoute = to.path === '/login' || to.path === '/signup'

  if (!isAuth && !isAuthRoute) {
    // Unauthenticated user trying to access protected route
    next('/login')
  } else if (isAuth && isAuthRoute) {
    // Already authenticated user trying to access login/signup
    next('/dashboard')
  } else {
    next()
  }
})

export default router

