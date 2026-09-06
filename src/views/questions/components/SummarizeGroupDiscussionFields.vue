<template>
  <div class="summarize-group-discussion-fields">
    <el-form-item
      label="语音"
      required
    >
      <MediaUploadRow
        :url="audioUrl"
        accept=".mp3,.wav,.m4a,.ogg"
        upload-action="/admin/upload/file"
        @update:url="emit('update:audioUrl', $event)"
      >
        <template #preview>
          <audio
            v-if="audioUrl"
            class="audio-preview"
            controls
            :src="audioUrl"
          />
        </template>
      </MediaUploadRow>
    </el-form-item>

    <el-form-item label="Transcript">
      <el-input
        :model-value="transcript"
        type="textarea"
        :rows="12"
        placeholder="讨论原文逐字稿（选填）"
        @update:model-value="emit('update:transcript', $event)"
      />
    </el-form-item>

    <el-form-item label="模范回答">
      <el-input
        :model-value="modelAnswerText"
        type="textarea"
        :rows="8"
        placeholder="供评分参考，不对学员展示（选填）"
        @update:model-value="emit('update:modelAnswerText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import MediaUploadRow from './MediaUploadRow.vue'

defineProps<{
  audioUrl: string
  transcript: string
  modelAnswerText: string
}>()

const emit = defineEmits<{
  'update:audioUrl': [value: string]
  'update:transcript': [value: string]
  'update:modelAnswerText': [value: string]
}>()
</script>

<style lang="scss" scoped>
.audio-preview {
  display: block;
  width: 100%;
  max-width: 480px;
  margin-top: 8px;
}
</style>
