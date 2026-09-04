export type QuestionPurpose = 'real' | 'practice' | 'mock'

export const QUESTION_PURPOSES: { value: QuestionPurpose; label: string }[] = [
  { value: 'real', label: '真题' },
  { value: 'practice', label: '练习' },
  { value: 'mock', label: '模考' },
]

export function purposeLabel(value: string | null | undefined): string {
  if (!value) {
    return ''
  } else {
    const hit = QUESTION_PURPOSES.find((item) => item.value === value)
    if (hit) {
      return hit.label
    } else {
      return value
    }
  }
}

export function purposeTagType(
  value: string | null | undefined,
): 'danger' | 'warning' | 'success' | 'info' {
  if (value === 'real') {
    return 'danger'
  } else if (value === 'mock') {
    return 'warning'
  } else if (value === 'practice') {
    return 'success'
  } else {
    return 'info'
  }
}
