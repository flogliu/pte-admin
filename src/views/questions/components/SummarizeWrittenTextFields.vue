<template>
  <div class="summarize-written-text-fields">
    <el-form-item label="原文" required>
      <el-input
        :model-value="passageText"
        type="textarea"
        :rows="20"
        placeholder="输入学员需要总结的英文原文"
        @update:model-value="emit('update:passageText', $event)"
      />
    </el-form-item>

    <el-form-item label="示范答案">
      <el-input
        :model-value="modelAnswerText"
        type="textarea"
        :rows="12"
        placeholder="预写一句话总结（5–75 词），供 AI 打分，不对学员展示"
        @update:model-value="emit('update:modelAnswerText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  passageText: string
  modelAnswerText: string
}>()

const emit = defineEmits<{
  'update:passageText': [value: string]
  'update:modelAnswerText': [value: string]
}>()
</script>
