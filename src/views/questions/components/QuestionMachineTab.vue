<template>
  <el-row :gutter="20">
    <el-col :xs="24" :md="8">
      <el-form-item label="机经来源">
        <el-select
          v-model="form.machine_source"
          placeholder="请选择考试国家/地区"
          filterable
          allow-create
          default-first-option
          style="width: 100%"
        >
          <el-option
            v-for="c in COUNTRIES"
            :key="c.value"
            :label="c.label"
            :value="c.value"
          />
        </el-select>
      </el-form-item>
    </el-col>
    <el-col :xs="24" :md="8">
      <el-form-item label="机经日期">
        <el-date-picker
          v-model="form.machine_exam_date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择考试日期"
          style="width: 100%"
        />
      </el-form-item>
    </el-col>
    <el-col :xs="24">
      <el-form-item label="机经备注">
        <el-input
          v-model="form.machine_memo"
          type="textarea"
          :rows="3"
          placeholder="考题出现回忆、变体说明、考场提示等"
        />
      </el-form-item>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import type { QuestionForm } from '@/types'
import { COUNTRIES } from '@/constants/country'

defineProps<{
  form: QuestionForm
}>()
</script>
