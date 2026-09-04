<template>
  <div class="listening-hiw-fields">
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
        :model-value="transcript"
        type="textarea"
        :rows="12"
        placeholder="输入学员看到的完整文稿（含错误词）"
        @update:model-value="emit('update:transcript', $event)"
      />
    </el-form-item>

    <el-form-item label="错误单词" required>
      <p class="section-hint">左边为文稿显示词，右边为录音正确词</p>
      <div class="incorrect-list">
        <div
          v-for="(pair, index) in incorrectWords"
          :key="index"
          class="incorrect-row"
        >
          <el-input
            :model-value="pair.display"
            placeholder="显示词"
            @update:model-value="updateDisplay(index, $event)"
          />
          <span class="arrow">→</span>
          <el-input
            :model-value="pair.spoken"
            placeholder="录音词"
            @update:model-value="updateSpoken(index, $event)"
          />
          <el-button
            v-if="incorrectWords.length > 1"
            type="danger"
            plain
            @click="removePair(index)"
          >
            删除
          </el-button>
        </div>
        <div class="incorrect-actions">
          <el-button type="primary" plain @click="addPair">添加错误词</el-button>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import MediaUploadRow from './MediaUploadRow.vue'

export type HiwIncorrectWordDraft = {
  display: string
  spoken: string
}

const props = defineProps<{
  audioUrl: string
  transcript: string
  incorrectWords: HiwIncorrectWordDraft[]
}>()

const emit = defineEmits<{
  'update:audioUrl': [value: string]
  'update:transcript': [value: string]
  'update:incorrectWords': [value: HiwIncorrectWordDraft[]]
}>()

watch(
  () => props.incorrectWords.length,
  () => {
    ensureMinPairs()
  },
  { immediate: true },
)

function emptyPair(): HiwIncorrectWordDraft {
  return {
    display: '',
    spoken: '',
  }
}

function ensureMinPairs() {
  if (props.incorrectWords.length >= 1) {
    return
  } else {
    emit('update:incorrectWords', [emptyPair()])
  }
}

function addPair() {
  emit('update:incorrectWords', [...props.incorrectWords, emptyPair()])
}

function removePair(index: number) {
  if (props.incorrectWords.length <= 1) {
    return
  } else {
    emit(
      'update:incorrectWords',
      props.incorrectWords.filter((_, i) => i !== index),
    )
  }
}

function updateDisplay(index: number, value: string) {
  emit('update:incorrectWords', mapPair(index, { display: value }))
}

function updateSpoken(index: number, value: string) {
  emit('update:incorrectWords', mapPair(index, { spoken: value }))
}

function mapPair(index: number, patch: Partial<HiwIncorrectWordDraft>) {
  return props.incorrectWords.map((item, i) => {
    if (i !== index) {
      return item
    } else {
      return { ...item, ...patch }
    }
  })
}
</script>

<style lang="scss" scoped>
.listening-hiw-fields {
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

.section-hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #909399;
}

.incorrect-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.incorrect-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
    min-width: 0;
  }

  :deep(.el-button) {
    flex: 0 0 auto;
  }
}

.arrow {
  flex: 0 0 auto;
  color: #909399;
}

.incorrect-actions {
  margin-top: 4px;
}
</style>
