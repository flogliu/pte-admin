import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, getAdminInfo } from '@/api/auth'
import type { AdminUserInfo, LoginForm } from '@/types'

interface UserState {
  token: string
  userInfo: AdminUserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    nickname: (state) => state.userInfo?.nickname || state.userInfo?.username || '',
    avatar: (state) => state.userInfo?.avatar || '',
    isSuperAdmin: (state) => state.userInfo?.isSuperAdmin || false,
  },
  actions: {
    async login(form: LoginForm) {
      const res = await apiLogin(form)
      this.token = res.data.token
      this.userInfo = res.data.userInfo
      return res.data
    },
    async fetchUserInfo() {
      const res = await getAdminInfo()
      this.userInfo = res.data
      return res.data
    },
    async logout() {
      try {
        await apiLogout()
      } catch (e) {
        // ignore: 401 / network errors during logout are OK
      }
      this.clear()
    },
    setToken(token: string) {
      this.token = token
    },
    clear() {
      this.token = ''
      this.userInfo = null
    },
  },
  persist: {
    key: 'pte-admin-user',
    paths: ['token', 'userInfo'],
  },
})
