<template>
  <div class="retell-lecture-fields">
    <el-form-item label="标题" prop="title" required>
      <el-input
        :model-value="title"
        placeholder="请输入题目标题（用于列表快速识别）"
        maxlength="255"
        show-word-limit
        @update:model-value="emit('update:title', $event)"
      />
    </el-form-item>

    <div class="prompt-section">
      <p class="section-hint">提示素材可上传一种或多种，至少填写一项</p>

      <el-form-item label="图片">
        <MediaUploadRow
          :url="imageUrl"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          upload-action="/admin/upload/image"
          @update:url="emit('update:imageUrl', $event)"
        >
          <template #preview>
            <img v-if="imageUrl" class="media-preview" :src="imageUrl" alt="图片预览" />
          </template>
        </MediaUploadRow>
      </el-form-item>

      <el-form-item label="视频">
        <MediaUploadRow
          :url="videoUrl"
          accept=".mp4,.webm,.mov"
          upload-action="/admin/upload/video"
          @update:url="emit('update:videoUrl', $event)"
        >
          <template #preview>
            <video v-if="videoUrl" class="media-preview" controls :src="videoUrl" />
          </template>
        </MediaUploadRow>
      </el-form-item>

      <el-form-item label="语音">
        <MediaUploadRow
          :url="audioUrl"
          accept=".mp3,.wav,.m4a,.ogg"
          upload-action="/admin/upload/file"
          @update:url="emit('update:audioUrl', $event)"
        >
          <template #preview>
            <audio v-if="audioUrl" class="media-preview" controls :src="audioUrl" />
          </template>
        </MediaUploadRow>
      </el-form-item>
    </div>

    <div class="model-answer-section">
      <p class="section-hint">理想复述供 AI 打分，不对学员展示</p>

      <el-form-item label="理想复述文本">
        <el-input
          :model-value="modelAnswerText"
          type="textarea"
          :rows="6"
          placeholder="预写理想复述稿"
          @update:model-value="emit('update:modelAnswerText', $event)"
        />
      </el-form-item>

      <el-form-item label="理想复述录音">
        <MediaUploadRow
          :url="modelAudioUrl"
          accept=".mp3,.wav,.m4a,.ogg"
          upload-action="/admin/upload/file"
          @update:url="emit('update:modelAudioUrl', $event)"
        >
          <template #preview>
            <audio v-if="modelAudioUrl" class="media-preview" controls :src="modelAudioUrl" />
          </template>
        </MediaUploadRow>
      </el-form-item>
    </div>
  </div>
</template>

<script setup lang="ts">
import MediaUploadRow from './MediaUploadRow.vue'

defineProps<{
  title: string
  imageUrl: string
  videoUrl: string
  audioUrl: string
  modelAnswerText: string
  modelAudioUrl: string
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'update:imageUrl': [value: string]
  'update:videoUrl': [value: string]
  'update:audioUrl': [value: string]
  'update:modelAnswerText': [value: string]
  'update:modelAudioUrl': [value: string]
}>()
</script>

<style lang="scss" scoped>
.prompt-section,
.model-answer-section {
  margin-top: 4px;
}

.section-hint {
  margin: 0 0 12px 110px;
  font-size: 12px;
  color: #909399;
}

.media-preview {
  display: block;
  width: 100%;
  max-width: 480px;
  margin-top: 8px;
  border-radius: 4px;
}

img.media-preview {
  border: 1px solid #ebeef5;
}
</style>
