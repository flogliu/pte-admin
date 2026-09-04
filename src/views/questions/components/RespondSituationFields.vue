<template>
  <div class="respond-situation-fields">
    <el-form-item label="情景描述" required>
      <el-input
        :model-value="situationText"
        type="textarea"
        :rows="6"
        placeholder="输入面向学员的情景描述"
        @update:model-value="emit('update:situationText', $event)"
      />
    </el-form-item>

    <el-form-item label="模范回答文本">
      <el-input
        :model-value="modelAnswerText"
        type="textarea"
        :rows="6"
        placeholder="预写理想回复，供 AI 打分，不对学员展示"
        @update:model-value="emit('update:modelAnswerText', $event)"
      />
    </el-form-item>

    <el-form-item label="模范回答录音">
      <div class="audio-row">
        <el-input
          :model-value="modelAudioUrl"
          placeholder="上传后自动填入，或粘贴音频 URL"
          clearable
          @update:model-value="emit('update:modelAudioUrl', $event)"
        />
        <el-upload
          :action="uploadAction"
          :headers="uploadHeaders"
          :show-file-list="false"
          accept=".mp3,.wav,.m4a,.ogg"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
        >
          <el-button type="primary">上传音频</el-button>
        </el-upload>
        <el-button v-if="modelAudioUrl" @click="emit('update:modelAudioUrl', '')">清除</el-button>
      </div>
      <audio v-if="modelAudioUrl" class="audio-preview" controls :src="modelAudioUrl" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'

defineProps<{
  situationText: string
  modelAnswerText: string
  modelAudioUrl: string
}>()

const emit = defineEmits<{
  'update:situationText': [value: string]
  'update:modelAnswerText': [value: string]
  'update:modelAudioUrl': [value: string]
}>()

const userStore = useUserStore()
const uploadAction = '/admin/upload/file'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`,
}))

const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  const res = response as {
    code?: number
    msg?: string
    message?: string
    data?: { url?: string }
  }
  if (res.code !== 0) {
    ElMessage.error(res.message || res.msg || '上传失败')
    return
  }
  const url = res.data?.url || ''
  if (!url) {
    ElMessage.error('上传成功但未返回音频地址')
    return
  }
  emit('update:modelAudioUrl', url)
  ElMessage.success('音频上传成功')
}

const handleUploadError: UploadProps['onError'] = () => {
  ElMessage.error('音频上传失败，请检查登录状态或手动填写 URL')
}
</script>

<style lang="scss" scoped>
.audio-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.audio-preview {
  display: block;
  width: 100%;
  max-width: 480px;
  margin-top: 8px;
}
</style>
