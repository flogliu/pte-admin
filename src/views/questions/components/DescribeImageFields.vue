<template>
  <div class="describe-image-fields">
    <el-form-item label="题目图片" required>
      <div class="image-row">
        <el-input
          :model-value="imageUrl"
          placeholder="上传后自动填入，或粘贴图片 URL"
          clearable
          @update:model-value="emit('update:imageUrl', $event)"
        />
        <el-upload
          :action="uploadAction"
          :headers="uploadHeaders"
          :show-file-list="false"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
        >
          <el-button type="primary">上传图片</el-button>
        </el-upload>
        <el-button v-if="imageUrl" @click="emit('update:imageUrl', '')">清除</el-button>
      </div>
      <img v-if="imageUrl" class="image-preview" :src="imageUrl" alt="题目图片预览" />
    </el-form-item>

    <el-form-item label="评分参考" required>
      <el-input
        :model-value="referenceText"
        type="textarea"
        :rows="8"
        placeholder="预写理想口述或关键点，供 AI 打分，不对学员展示"
        @update:model-value="emit('update:referenceText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps } from 'element-plus'
import { useUserStore } from '@/stores/user'

defineProps<{
  imageUrl: string
  referenceText: string
}>()

const emit = defineEmits<{
  'update:imageUrl': [value: string]
  'update:referenceText': [value: string]
}>()

const userStore = useUserStore()
const uploadAction = '/admin/upload/image'
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
    ElMessage.error('上传成功但未返回图片地址')
    return
  }
  emit('update:imageUrl', url)
  ElMessage.success('图片上传成功')
}

const handleUploadError: UploadProps['onError'] = () => {
  ElMessage.error('图片上传失败，请检查登录状态或手动填写 URL')
}
</script>

<style lang="scss" scoped>
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
}

.image-preview {
  display: block;
  width: 100%;
  max-width: 480px;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
</style>
