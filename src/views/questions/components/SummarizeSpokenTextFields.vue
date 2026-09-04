<template>
  <div class="summarize-spoken-text-fields">
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

    <el-form-item label="转述文本">
      <el-input
        :model-value="transcript"
        type="textarea"
        :rows="12"
        placeholder="Transcript，听力原文逐字稿（选填）"
        @update:model-value="emit('update:transcript', $event)"
      />
    </el-form-item>

    <el-form-item label="模范总结">
      <el-input
        :model-value="modelSummaryText"
        type="textarea"
        :rows="8"
        placeholder="Model Summary，预写 50–70 词总结，供 AI 打分，不对学员展示（选填）"
        @update:model-value="emit('update:modelSummaryText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import MediaUploadRow from './MediaUploadRow.vue'

defineProps<{
  audioUrl: string
  transcript: string
  modelSummaryText: string
}>()

const emit = defineEmits<{
  'update:audioUrl': [value: string]
  'update:transcript': [value: string]
  'update:modelSummaryText': [value: string]
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
