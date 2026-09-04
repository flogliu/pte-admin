<template>
  <div class="listening-mc-multiple-fields">
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

    <el-form-item :label="transcriptLabel" :required="transcriptRequired">
      <el-input
        :model-value="transcript"
        type="textarea"
        :rows="12"
        :placeholder="transcriptPlaceholder"
        @update:model-value="emit('update:transcript', $event)"
      />
    </el-form-item>

    <el-form-item label="选项" required>
      <div class="option-list">
        <div
          v-for="(option, index) in options"
          :key="index"
          class="option-row"
        >
          <el-radio
            v-if="singleSelect"
            :model-value="option.checked"
            :value="true"
            @change="selectSingle(index)"
          />
          <el-checkbox
            v-else
            :model-value="option.checked"
            @update:model-value="updateChecked(index, $event)"
          />
          <span class="option-key">{{ optionKey(index) }}.</span>
          <el-input
            :model-value="option.text"
            placeholder="选项内容"
            @update:model-value="updateText(index, $event)"
          />
          <el-button
            v-if="options.length > 2"
            type="danger"
            plain
            @click="removeOption(index)"
          >
            删除
          </el-button>
        </div>
        <div class="option-actions">
          <el-button
            type="primary"
            plain
            :disabled="options.length >= optionKeys.length"
            @click="addOption"
          >
            添加选项
          </el-button>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import MediaUploadRow from './MediaUploadRow.vue'
import type { McOptionDraft } from './ReadingMcMultipleFields.vue'

const optionKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const props = withDefaults(
  defineProps<{
    audioUrl: string
    transcript: string
    options: McOptionDraft[]
    singleSelect?: boolean
    transcriptRequired?: boolean
  }>(),
  {
    singleSelect: false,
    transcriptRequired: false,
  },
)

const transcriptLabel = '转述文本'

const transcriptPlaceholder = computed(() => {
  if (props.transcriptRequired) {
    return 'Transcript，听力原文逐字稿'
  } else {
    return 'Transcript，听力原文逐字稿（选填）'
  }
})

const emit = defineEmits<{
  'update:audioUrl': [value: string]
  'update:transcript': [value: string]
  'update:options': [value: McOptionDraft[]]
}>()

watch(
  () => props.options.length,
  () => {
    ensureMinOptions()
  },
  { immediate: true },
)

function emptyOption(): McOptionDraft {
  return {
    text: '',
    checked: false,
  }
}

function optionKey(index: number): string {
  return optionKeys.charAt(index) || String(index + 1)
}

function ensureMinOptions() {
  if (props.options.length >= 2) {
    return
  } else {
    const extra = Array.from({ length: 2 - props.options.length }, () => emptyOption())
    emit('update:options', [...props.options, ...extra])
  }
}

function addOption() {
  if (props.options.length >= optionKeys.length) {
    return
  } else {
    emit('update:options', [...props.options, emptyOption()])
  }
}

function removeOption(index: number) {
  if (props.options.length <= 2) {
    return
  } else {
    emit(
      'update:options',
      props.options.filter((_, i) => i !== index),
    )
  }
}

function updateText(index: number, value: string) {
  const next = props.options.map((item, i) => {
    if (i !== index) {
      return item
    } else {
      return { ...item, text: value }
    }
  })
  emit('update:options', next)
}

function updateChecked(index: number, value: boolean | string | number) {
  const checked = value === true
  const next = props.options.map((item, i) => {
    if (i !== index) {
      return item
    } else {
      return { ...item, checked }
    }
  })
  emit('update:options', next)
}

function selectSingle(index: number) {
  const next = props.options.map((item, i) => {
    if (i === index) {
      return { ...item, checked: true }
    } else {
      return { ...item, checked: false }
    }
  })
  emit('update:options', next)
}
</script>

<style lang="scss" scoped>
.listening-mc-multiple-fields {
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

.option-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-bottom: 8px;

  :deep(.el-checkbox),
  :deep(.el-radio) {
    flex: 0 0 auto;
    margin-right: 0;
    height: auto;
  }

  :deep(.el-input) {
    flex: 1 1 auto;
    min-width: 0;
    width: auto;
  }

  :deep(.el-button) {
    flex: 0 0 auto;
  }
}

.option-key {
  flex: 0 0 auto;
  width: auto;
  margin: 0;
  font-weight: 600;
  line-height: 1;
  color: #303133;
}

.option-actions {
  width: auto;
  align-self: flex-start;
}
</style>
