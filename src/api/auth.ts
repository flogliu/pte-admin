import { request } from '@/utils/request'
import type { ApiResponse, LoginForm, LoginResult, AdminUserInfo } from '@/types'

export function login(data: LoginForm): Promise<ApiResponse<LoginResult>> {
  return request({
    url: '/admin/auth/login',
    method: 'post',
    data,
  })
}

export function logout(): Promise<ApiResponse<void>> {
  return request({
    url: '/admin/auth/logout',
    method: 'post',
  })
}

export function getAdminInfo(): Promise<ApiResponse<AdminUserInfo>> {
  return request({
    url: '/admin/auth/me',
    method: 'get',
  })
}
