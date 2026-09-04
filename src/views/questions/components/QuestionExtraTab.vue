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
  <el-form-item label="标记" required>
    <el-radio-group v-model="props.form.purpose">
      <el-radio
        v-for="item in QUESTION_PURPOSES"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </el-radio>
    </el-radio-group>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuestionForm } from '@/types'
import { QUESTION_PURPOSES } from '@/constants/purpose'

const props = defineProps<{
  form: QuestionForm
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
