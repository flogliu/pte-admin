export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminUserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  mobile: string
  roles: number[]
  isSuperAdmin: boolean
}

export interface LoginResult {
  token: string
  userInfo: AdminUserInfo
}

export interface LoginForm {
  username: string
  password: string
}

export interface QuestionType {
  id: number
  code: string
  slug: string
  title: string
  title_en: string
  label_name: string
  section: string
  support: string[]
  scoring_mode: string
  label: string
  description: string
  description_en?: string
  created_at?: string
  updated_at?: string
}

export interface QuestionSection {
  key: string
  label: string
}

export interface Question {
  id: number
  exam_type: string
  question_type_id: number
  type_slug: string
  type_label: string
  type_section: string
  title: string
  content: string
  difficulty: number | null
  purpose: string
  status: number | null
  machine_source: string | null
  machine_exam_date: string | null
  machine_memo: string | null
  meta: Record<string, any> | string | null
  created_at?: string
  updated_at?: string
}

export interface QuestionQuery {
  page?: number
  pageSize?: number
  exam_type?: string
  question_type_id?: number
  type_section?: string
  keyword?: string
  difficulty?: number
  purpose?: string
  status?: number | string
}

export interface QuestionForm {
  id?: number
  exam_type: string
  question_type_id: number | null
  title: string
  content: string
  difficulty: number | null
  purpose: string
  status: number | null
  machine_source: string
  machine_exam_date: string
  machine_memo: string
  meta: Record<string, any>
}
