export interface ExamTypeOption {
  value: string
  label: string
}

export const EXAM_TYPES: ExamTypeOption[] = [
  { value: 'core', label: 'PTE CORE' },
  { value: 'academic', label: 'PTE Academic' },
]

export const EXAM_TYPES_ALL: ExamTypeOption[] = [
  { value: 'core', label: 'PTE CORE' },
  { value: 'academic', label: 'PTE Academic' },
  { value: 'academic_ukvi', label: 'PTE Academic UKVI' },
  { value: 'home', label: 'PTE Home' },
]

export function examTypeLabel(v: string | null | undefined): string {
  if (!v) return ''
  const hit = EXAM_TYPES_ALL.find((e) => e.value === v)
  return hit?.label || v
}
