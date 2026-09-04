<template>
  <div class="listening-fib-l-fields">
    <el-form-item label="语音" required>
      <MediaUploadRow
        :url="audioUrl"
        accept=".mp3,.wav,.m4a,.ogg"
        upload-action="/admin/upload/file"
        @update:url="emit('update:audioUrl', $event)"
      >
        <template #preview>
          <audio v-if="audioUrl" class="audio-preview" controls :src="audioUrl" />
        </template>
      </MediaUploadRow>
    </el-form-item>

    <el-form-item label="转述文本" required>
      <el-input
        ref="passageInputRef"
        :model-value="transcript"
        type="textarea"
        :rows="16"
        placeholder="在需要填空的位置插入 {{1}}、{{2}}，例如：The budget meeting was {{1}} but we {{2}} agreed."
        @update:model-value="emit('update:transcript', $event)"
      />
      <div class="passage-actions">
        <el-button type="primary" plain @click="insertBlank">插入空白</el-button>
        <span class="hint-text">当前 {{ blankCount }} 个空</span>
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
        <span v-if="blanks.length === 0" class="hint-text">请先在转述文本中插入空白</span>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { InputInstance } from 'element-plus'
import MediaUploadRow from './MediaUploadRow.vue'
import type { FibDragBlankDraft } from './ReadingFibDragFields.vue'

const props = defineProps<{
  audioUrl: string
  transcript: string
  blanks: FibDragBlankDraft[]
}>()

const emit = defineEmits<{
  'update:audioUrl': [value: string]
  'update:transcript': [value: string]
  'update:blanks': [value: FibDragBlankDraft[]]
}>()

const passageInputRef = ref<InputInstance>()
const blankCount = computed(() => scanBlankIds(props.transcript).length)

watch(
  () => props.transcript,
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
  const token = `{{${nextBlankId(props.transcript)}}}`
  const textarea = getPassageTextarea()
  if (!textarea) {
    emit('update:transcript', `${props.transcript}${token}`)
  } else {
    insertBlankAtCursor(textarea, token)
  }
}

function insertBlankAtCursor(textarea: HTMLTextAreaElement, token: string) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const next = `${props.transcript.slice(0, start)}${token}${props.transcript.slice(end)}`
  emit('update:transcript', next)
  const cursor = start + token.length
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(cursor, cursor)
  })
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
.listening-fib-l-fields {
  :deep(.el-form-item__content) {
    display: block;
    width: 100%;
  }
}

.audio-preview {
  display: block;
  width: 100%;
  max-width: 480px;
  margin-top: 8px;
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

.answer-row {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.answer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  :deep(.el-input) {
    flex: 0 0 auto;
    width: 16ch;
  }
}

.answer-label {
  flex: 0 0 auto;
  font-weight: 600;
  color: #303133;
}
</style>
