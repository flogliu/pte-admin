<template>
  <div class="listening-wfd-fields">
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

    <el-form-item label="答案" required>
      <el-input
        :model-value="answerText"
        type="textarea"
        :rows="5"
        placeholder="输入完整听写句子，作为标准答案"
        @update:model-value="emit('update:answerText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import MediaUploadRow from './MediaUploadRow.vue'

defineProps<{
  audioUrl: string
  answerText: string
}>()

const emit = defineEmits<{
  'update:audioUrl': [value: string]
  'update:answerText': [value: string]
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
