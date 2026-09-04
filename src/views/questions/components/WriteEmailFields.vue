<template>
  <div class="write-email-fields">
    <el-form-item label="邮件内容描述" required>
      <el-input
        :model-value="scenarioText"
        type="textarea"
        :rows="16"
        placeholder="输入学员需要回复的邮件情景或任务说明"
        @update:model-value="emit('update:scenarioText', $event)"
      />
    </el-form-item>

    <el-form-item label="邮件示例">
      <el-input
        :model-value="sampleEmailText"
        type="textarea"
        :rows="16"
        placeholder="预写示范邮件（50–120 词，含称呼与签名），供 AI 打分，不对学员展示"
        @update:model-value="emit('update:sampleEmailText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  scenarioText: string
  sampleEmailText: string
}>()

const emit = defineEmits<{
  'update:scenarioText': [value: string]
  'update:sampleEmailText': [value: string]
}>()
</script>
