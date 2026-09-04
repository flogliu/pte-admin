import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

export interface PteAxiosRequestConfig extends AxiosRequestConfig {
  skipAuthHandler?: boolean
}

const service: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let authClearing = false

function applyRefreshedToken(headers: Record<string, unknown> | undefined) {
  if (!headers) {
    return
  }
  const refreshed = headers['x-admin-token']
  if (typeof refreshed === 'string' && refreshed !== '') {
    useUserStore().setToken(refreshed)
  }
}

function handleUnauthorized(config: PteAxiosRequestConfig | undefined) {
  if (config?.skipAuthHandler || authClearing) {
    return
  }
  authClearing = true
  const userStore = useUserStore()
  userStore.clear()
  ElMessage.warning('登录已过期，请重新登录')
  const path = router.currentRoute.value.fullPath
  if (!path.startsWith('/login')) {
    router.push({ path: '/login', query: { redirect: path } })
  }
  setTimeout(() => {
    authClearing = false
  }, 300)
}

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = userStore.token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

service.interceptors.response.use(
  (response) => {
    applyRefreshedToken(response.headers as Record<string, unknown>)
    const res = response.data
    const config = response.config as InternalAxiosRequestConfig & PteAxiosRequestConfig
    if (res.code !== undefined && res.code !== 0) {
      if (res.code === 401) {
        handleUnauthorized(config)
      } else {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const config = error.config as (InternalAxiosRequestConfig & PteAxiosRequestConfig) | undefined
    if (status === 401) {
      handleUnauthorized(config)
    } else {
      const data: any = error.response?.data
      ElMessage.error(data?.message || error.message || '网络错误')
    }
    return Promise.reject(error)
  },
)

export function request<T = any>(config: PteAxiosRequestConfig): Promise<T> {
  return service.request<any, T>(config)
}

export default service
