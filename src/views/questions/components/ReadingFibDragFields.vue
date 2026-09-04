<template>
  <div class="reading-fib-drag-fields">
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
        placeholder="在需要拖拽填空的位置插入 {{1}}、{{2}}，例如：Many {{1}} areas now add green spaces."
        @update:model-value="emit('update:passageText', $event)"
      />
      <div class="passage-actions">
        <el-button type="primary" plain @click="insertBlank">插入空白</el-button>
        <span class="hint-text">当前 {{ blankCount }} 个空</span>
      </div>
    </el-form-item>

    <el-form-item label="备选单词">
      <div class="word-bank">
        <el-tag
          v-for="(word, index) in wordBank"
          :key="`${word}-${index}`"
          closable
          @close="removeWord(index)"
        >
          {{ word }}
        </el-tag>
        <el-input
          v-model="wordInput"
          class="word-input"
          placeholder="输入单词后回车"
          @keyup.enter.prevent="addWord"
        />
      </div>
    </el-form-item>

    <el-form-item label="答案" required>
      <div class="answer-row">
        <div
          v-for="(blank, index) in blanks"
          :key="blank.id || index"
          class="answer-item"
        >
          <span class="answer-label">{{ blank.id }}:</span>
          <el-input
            :model-value="blank.answer"
            maxlength="18"
            placeholder="单词"
            @update:model-value="updateAnswer(index, $event)"
          />
        </div>
        <span v-if="blanks.length === 0" class="hint-text">请先在文稿中插入空白</span>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { InputInstance } from 'element-plus'

export type FibDragBlankDraft = {
  id: string
  answer: string
}

const props = defineProps<{
  title: string
  passageText: string
  blanks: FibDragBlankDraft[]
  wordBank: string[]
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:passageText': [value: string]
  'update:blanks': [value: FibDragBlankDraft[]]
  'update:wordBank': [value: string[]]
}>()

const passageInputRef = ref<InputInstance>()
const wordInput = ref('')

const blankCount = computed(() => scanBlankIds(props.passageText).length)

watch(
  () => props.passageText,
  (text) => {
    syncBlanksByIds(scanBlankIds(text))
  },
  { immediate: true },
)

function emptyBlank(id: string): FibDragBlankDraft {
  return {
    id,
    answer: '',
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
      // 重复编号不重复建答案格
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

function addWord() {
  const word = wordInput.value.trim()
  if (!word) {
    return
  } else if (props.wordBank.includes(word)) {
    wordInput.value = ''
  } else {
    emit('update:wordBank', [...props.wordBank, word])
    wordInput.value = ''
  }
}

function removeWord(index: number) {
  emit(
    'update:wordBank',
    props.wordBank.filter((_, i) => i !== index),
  )
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
</script>

<style lang="scss" scoped>
.reading-fib-drag-fields {
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

.word-bank {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.word-input {
  width: 18ch;
}

.answer-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 4px;

  :deep(.el-input) {
    width: 18ch;
  }
}

.answer-label {
  flex: 0 0 auto;
  font-weight: 600;
  color: #303133;
}
</style>
