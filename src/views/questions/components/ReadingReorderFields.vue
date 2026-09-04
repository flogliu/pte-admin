<template>
  <div class="reading-reorder-fields">
    <el-form-item
      v-for="(paragraph, index) in paragraphs"
      :key="paragraph.id || index"
      :label="`段落 ${index + 1}`"
      required
    >
      <div class="paragraph-row">
        <el-input
          :model-value="paragraph.text"
          type="textarea"
          :rows="4"
          placeholder="按正确顺序输入段落内容"
          @update:model-value="updateText(index, $event)"
        />
        <el-button
          v-if="paragraphs.length > 2"
          type="danger"
          plain
          @click="removeParagraph(index)"
        >
          删除
        </el-button>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" plain @click="addParagraph">添加段落</el-button>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

export type ReorderParagraphDraft = {
  id: string
  text: string
}

const props = defineProps<{
  paragraphs: ReorderParagraphDraft[]
}>()

const emit = defineEmits<{
  'update:paragraphs': [value: ReorderParagraphDraft[]]
}>()

watch(
  () => props.paragraphs.length,
  () => {
    ensureMinParagraphs()
  },
  { immediate: true },
)

function emptyParagraph(id: string): ReorderParagraphDraft {
  return {
    id,
    text: '',
  }
}

function nextParagraphId(): string {
  let max = 0
  for (const item of props.paragraphs) {
    const n = Number.parseInt(String(item.id).replace(/^p/i, ''), 10)
    if (!Number.isNaN(n) && n > max) {
      max = n
    }
  }
  return `p${max + 1}`
}

function ensureMinParagraphs() {
  if (props.paragraphs.length >= 2) {
    return
  } else {
    const extra: ReorderParagraphDraft[] = []
    let id = nextParagraphId()
    while (props.paragraphs.length + extra.length < 2) {
      extra.push(emptyParagraph(id))
      const n = Number.parseInt(id.replace(/^p/i, ''), 10)
      id = `p${n + 1}`
    }
    emit('update:paragraphs', [...props.paragraphs, ...extra])
  }
}

function addParagraph() {
  emit('update:paragraphs', [...props.paragraphs, emptyParagraph(nextParagraphId())])
}

function removeParagraph(index: number) {
  if (props.paragraphs.length <= 2) {
    return
  } else {
    emit(
      'update:paragraphs',
      props.paragraphs.filter((_, i) => i !== index),
    )
  }
}

function updateText(index: number, value: string) {
  const next = props.paragraphs.map((item, i) => {
    if (i !== index) {
      return item
    } else {
      return { ...item, text: value }
    }
  })
  emit('update:paragraphs', next)
}
</script>

<style lang="scss" scoped>
.reading-reorder-fields {
  :deep(.el-form-item__content) {
    display: block;
    width: 100%;
  }
}

.paragraph-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;

  :deep(.el-textarea) {
    flex: 1 1 auto;
    min-width: 0;
  }

  :deep(.el-button) {
    flex: 0 0 auto;
    margin-top: 4px;
  }
}
</style>
