import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TasksView from '../views/TasksView.vue'
import ProfileView from '../views/ProfileView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import PractiseView from '@/views/PractiseView.vue'
import PractiseDetailsView from '@/views/PractiseDetailsView.vue'
import LoginView from '@/views/LoginView.vue'

import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/practise',
      name: 'practise',
      component: PractiseView,
      meta: { requiresAuth: true },
    },
    {
      path: '/practise/:id',
      name: 'practiseDetails',
      component: PractiseDetailsView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  const isAuthenticated = userStore.isLoggedIn

  if (to.meta.requiresAuth && !isAuthenticated) {
    alert('请先完成登录，才能进行练习哦！')
    return { name: 'login', query: { redirect: to.fullPath } }
  } else {
    return true
  }
})

export default router
