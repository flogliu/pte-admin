<template>
  <el-form-item label="难度">
    <div class="difficulty-row">
      <el-rate
        v-model="difficultyModel"
        :max="10"
        allow-half
        clearable
        :show-score="props.form.difficulty != null"
        score-template="{value} 分"
      />
      <span v-if="props.form.difficulty == null" class="score-hint">未设置</span>
    </div>
  </el-form-item>
  <el-form-item label="解读">
    <el-input
      v-model="props.metaFields.coachingTip"
      type="textarea"
      :rows="5"
      maxlength="2000"
      show-word-limit
      placeholder="选填，题目点拨或答题解读"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuestionForm } from '@/types'

const props = defineProps<{
  form: QuestionForm
  metaFields: { coachingTip: string }
}>()

const difficultyModel = computed({
  get() {
    return props.form.difficulty ?? 0
  },
  set(value: number) {
    if (value > 0) {
      props.form.difficulty = value
    } else {
      props.form.difficulty = null
    }
  },
})
</script>

<style lang="scss" scoped>
.difficulty-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-hint {
  font-size: 13px;
  color: #909399;
}
</style>
