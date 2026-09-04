<template>
  <div class="write-essay-fields">
    <el-form-item label="题目" required>
      <el-input
        :model-value="promptText"
        type="textarea"
        :rows="6"
        placeholder="输入学员需要作答的作文题干"
        @update:model-value="emit('update:promptText', $event)"
      />
    </el-form-item>

    <el-form-item label="范文">
      <el-input
        :model-value="sampleEssayText"
        type="textarea"
        :rows="20"
        placeholder="预写示范议论文（200–300 词），供 AI 打分，不对学员展示"
        @update:model-value="emit('update:sampleEssayText', $event)"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  promptText: string
  sampleEssayText: string
}>()

const emit = defineEmits<{
  'update:promptText': [value: string]
  'update:sampleEssayText': [value: string]
}>()
</script>
