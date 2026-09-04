import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'

NProgress.configure({ showSpinner: false })

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', public: true, hidden: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'DataAnalysis' },
      },
      {
        path: 'questions/list',
        name: 'QuestionList',
        component: () => import('@/views/questions/list.vue'),
        meta: { title: '题库管理', icon: 'Notebook' },
      },
      {
        path: 'questions/create',
        name: 'QuestionCreate',
        component: () => import('@/views/questions/form.vue'),
        meta: { title: '新增题目', icon: 'Plus', hidden: true, activeMenu: '/questions/list' },
      },
      {
        path: 'questions/edit/:id',
        name: 'QuestionEdit',
        component: () => import('@/views/questions/form.vue'),
        meta: { title: '编辑题目', icon: 'Edit', hidden: true, activeMenu: '/questions/list' },
      },
    ],
  },
  {
    path: '/questions',
    redirect: '/questions/list',
    meta: { hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH || '/'),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

const WHITE_LIST = ['/login', '/404']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  const title = (to.meta?.title as string) || ''
  document.title = title ? `${title} - PTE Teacher Admin` : 'PTE Teacher Admin'

  const userStore = useUserStore()

  if (to.meta.public || WHITE_LIST.includes(to.path)) {
    if (to.path === '/login' && userStore.isLoggedIn) {
      next({ path: '/', replace: true })
    } else {
      next()
    }
    return
  }

  if (!userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
    return
  }

  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      userStore.clear()
      next({ path: '/login', query: { redirect: to.fullPath }, replace: true })
      return
    }
  }

  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
