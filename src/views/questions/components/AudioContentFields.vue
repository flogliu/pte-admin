<template>
  <div class="audio-content-fields">
    <el-form-item :label="textLabel" required>
      <el-input
        :model-value="contentText"
        type="textarea"
        :rows="8"
        :placeholder="textPlaceholder"
        @update:model-value="emit('update:contentText', $event)"
      />
    </el-form-item>

    <el-form-item :label="audioLabel">
      <div class="audio-row">
        <el-input
          :model-value="audioUrl"
          placeholder="上传后自动填入，或粘贴音频 URL"
          clearable
          @update:model-value="emit('update:audioUrl', $event)"
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
        <el-button v-if="audioUrl" @click="emit('update:audioUrl', '')">清除</el-button>
      </div>
      <audio v-if="audioUrl" class="audio-preview" controls :src="audioUrl" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'

withDefaults(
  defineProps<{
    contentText: string
    audioUrl: string
    textLabel?: string
    textPlaceholder?: string
    audioLabel?: string
  }>(),
  {
    textLabel: '朗读文本',
    textPlaceholder: '输入需要朗读的英文段落',
    audioLabel: '母语者音频',
  },
)

const emit = defineEmits<{
  'update:contentText': [value: string]
  'update:audioUrl': [value: string]
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
  emit('update:audioUrl', url)
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
