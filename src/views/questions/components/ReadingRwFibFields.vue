<template>
  <div class="reading-rw-fib-fields">
    <el-form-item label="标题" required>
      <el-input
        :model-value="title"
        maxlength="255"
        show-word-limit
        placeholder="请输入题目标题（用于列表快速识别）"
        @update:model-value="emit('update:title', $event)"
      />
    </el-form-item>

    <el-form-item label="文稿" required>
      <el-input
        ref="passageInputRef"
        :model-value="passageText"
        type="textarea"
        :rows="16"
        placeholder="在需要下拉填空的位置插入 {{1}}、{{2}}，例如：Many {{1}} areas now add green spaces."
        @update:model-value="emit('update:passageText', $event)"
      />
      <div class="passage-actions">
        <el-button type="primary" plain @click="insertBlank">插入选择项</el-button>
        <span class="hint-text">当前 {{ blankCount }} 个空</span>
      </div>
    </el-form-item>

    <el-form-item
      v-for="(blank, index) in blanks"
      :key="blank.id || index"
      :label="`选择项[${blank.id}]`"
      required
    >
      <div class="option-row">
        <el-input
          class="option-input"
          :model-value="blank.answer"
          maxlength="18"
          placeholder="正确选项"
          @update:model-value="updateAnswer(index, $event)"
        />
        <el-input
          v-for="distIndex in 3"
          :key="`${blank.id}-${distIndex}`"
          class="option-input"
          :model-value="blank.distractors[distIndex - 1]"
          maxlength="18"
          placeholder="错误选项"
          @update:model-value="updateDistractor(index, distIndex - 1, $event)"
        />
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { InputInstance } from 'element-plus'

export type FibBlankDraft = {
  id: string
  answer: string
  distractors: [string, string, string]
}

const props = defineProps<{
  title: string
  passageText: string
  blanks: FibBlankDraft[]
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:passageText': [value: string]
  'update:blanks': [value: FibBlankDraft[]]
}>()

const passageInputRef = ref<InputInstance>()

const blankCount = computed(() => scanBlankIds(props.passageText).length)

watch(
  () => props.passageText,
  (text) => {
    syncBlanksByIds(scanBlankIds(text))
  },
  { immediate: true },
)

function emptyBlank(id: string): FibBlankDraft {
  return {
    id,
    answer: '',
    distractors: ['', '', ''],
  }
}

function scanBlankIds(text: string): string[] {
  const ids: string[] = []
  const re = /\{\{(\d+)\}\}/g
  let match = re.exec(text)
  while (match) {
    if (!ids.includes(match[1]!)) {
      ids.push(match[1]!)
    } else {
      // 重复编号不重复建卡片
    }
    match = re.exec(text)
  }
  return ids
}

function nextBlankId(text: string): string {
  const ids = scanBlankIds(text)
  let max = 0
  for (const id of ids) {
    const n = Number.parseInt(id, 10)
    if (n > max) {
      max = n
    }
  }
  return String(max + 1)
}

function sameBlankIds(ids: string[]): boolean {
  if (ids.length !== props.blanks.length) {
    return false
  } else {
    return ids.every((id, index) => props.blanks[index]?.id === id)
  }
}

function syncBlanksByIds(ids: string[]) {
  if (sameBlankIds(ids)) {
    return
  } else {
    const byId = new Map(props.blanks.map((item) => [item.id, item]))
    const next = ids.map((id) => byId.get(id) || emptyBlank(id))
    emit('update:blanks', next)
  }
}

function getPassageTextarea(): HTMLTextAreaElement | null {
  const root = passageInputRef.value?.$el as HTMLElement | undefined
  if (!root) {
    return null
  } else {
    return root.querySelector('textarea')
  }
}

function insertBlank() {
  const token = `{{${nextBlankId(props.passageText)}}}`
  const textarea = getPassageTextarea()
  if (!textarea) {
    emit('update:passageText', `${props.passageText}${token}`)
  } else {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const next = `${props.passageText.slice(0, start)}${token}${props.passageText.slice(end)}`
    emit('update:passageText', next)
    const cursor = start + token.length
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }
}

function updateAnswer(index: number, value: string) {
  const next = props.blanks.map((item, i) => {
    if (i !== index) {
      return item
    } else {
      return { ...item, answer: value }
    }
  })
  emit('update:blanks', next)
}

function updateDistractor(index: number, distIndex: number, value: string) {
  const next = props.blanks.map((item, i) => {
    if (i !== index) {
      return item
    } else {
      const distractors = [...item.distractors] as [string, string, string]
      distractors[distIndex] = value
      return { ...item, distractors }
    }
  })
  emit('update:blanks', next)
}
</script>

<style lang="scss" scoped>
.reading-rw-fib-fields {
  :deep(.el-form-item__content) {
    display: block;
    width: 100%;
  }
}

.passage-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.hint-text {
  font-size: 12px;
  color: #909399;
}

.option-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.option-input {
  width: 18ch;
}
</style>
