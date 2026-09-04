<template>
  <div class="media-upload">
    <el-input
      :model-value="url"
      placeholder="上传后自动填入，或粘贴 URL"
      clearable
      @update:model-value="emit('update:url', $event)"
    />
    <div class="media-upload-actions">
      <el-upload
        :action="uploadAction"
        :headers="uploadHeaders"
        :show-file-list="false"
        :accept="accept"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      >
        <el-button type="primary">上传</el-button>
      </el-upload>
      <el-button v-if="url" @click="emit('update:url', '')">清除</el-button>
    </div>
    <slot name="preview" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  url: string
  accept: string
  uploadAction: string
}>()

const emit = defineEmits<{
  'update:url': [value: string]
}>()

const userStore = useUserStore()
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
  const nextUrl = res.data?.url || ''
  if (!nextUrl) {
    ElMessage.error('上传成功但未返回文件地址')
    return
  }
  emit('update:url', nextUrl)
  ElMessage.success('上传成功')
}

const handleUploadError: UploadProps['onError'] = () => {
  ElMessage.error('上传失败，请检查登录状态或手动填写 URL')
}
</script>

<style lang="scss" scoped>
.media-upload {
  width: 100%;
}

.media-upload-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
</style>
