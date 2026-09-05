import { request } from '@/utils/request'
import type { ApiResponse, PageResult, Question, QuestionQuery, QuestionType, QuestionSection } from '@/types'

export function getQuestionTypes(params?: { exam_type?: string }): Promise<ApiResponse<QuestionType[]>> {
  return request({
    url: '/admin/question-types',
    method: 'get',
    params,
  })
}

export function getQuestionSections(): Promise<ApiResponse<QuestionSection[]>> {
  return request({
    url: '/admin/question-sections',
    method: 'get',
  })
}

export function getQuestionList(params: QuestionQuery): Promise<ApiResponse<PageResult<Question>>> {
  const purpose = Array.isArray(params.purpose)
    ? params.purpose.join(',')
    : params.purpose
  return request({
    url: '/admin/questions',
    method: 'get',
    params: {
      ...params,
      purpose,
    },
  })
}

export function getQuestionDetail(id: number): Promise<ApiResponse<Question>> {
  return request({
    url: `/admin/questions/${id}`,
    method: 'get',
  })
}

export function createQuestion(data: Partial<Question>): Promise<ApiResponse<{ id: number }>> {
  return request({
    url: '/admin/questions',
    method: 'post',
    data,
  })
}

export function updateQuestion(id: number, data: Partial<Question>): Promise<ApiResponse<void>> {
  return request({
    url: `/admin/questions/${id}`,
    method: 'put',
    data,
  })
}

export function deleteQuestions(ids: number[]): Promise<ApiResponse<void>> {
  return request({
    url: '/admin/questions/delete',
    method: 'post',
    data: { ids },
  })
}
