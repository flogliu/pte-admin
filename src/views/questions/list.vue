<template>
  <div class="page-container">
    <div class="page-card">
      <el-form :inline="true" :model="query" class="filter-bar" @submit.prevent>
        <el-form-item label="题库类型">
          <el-checkbox-group v-model="query.purpose" @change="onPurposeChange">
            <el-checkbox
              v-for="item in QUESTION_PURPOSES"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="搜索标题/内容/来源"
            clearable
            style="width: 320px"
            @keyup.enter="loadList"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadList">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><RefreshLeft /></el-icon>重置
          </el-button>
          <el-tooltip
            content="高级筛选"
            placement="top"
            :disabled="advancedOpen"
          >
            <el-button :icon="ArrowDown" circle @click="advancedOpen = !advancedOpen" />
          </el-tooltip>
        </el-form-item>
      </el-form>

      <el-collapse-transition>
        <el-form
          v-show="advancedOpen"
          :inline="true"
          :model="query"
          class="filter-bar advanced-filter"
          @submit.prevent
        >
          <el-form-item label="考试类型">
            <el-select
              v-model="query.exam_type"
              placeholder="全部"
              clearable
              style="width: 200px"
              @change="handleExamTypeChangeOnList"
            >
              <el-option
                v-for="e in EXAM_TYPES"
                :key="e.value"
                :label="e.label"
                :value="e.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="板块">
            <el-select v-model="query.type_section" placeholder="全部板块" clearable style="width: 180px">
              <el-option
                v-for="s in sections"
                :key="s.key"
                :label="s.label"
                :value="s.key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="题型">
            <el-select
              v-model="query.question_type_id"
              placeholder="全部题型"
              clearable
              filterable
              style="width: 260px"
            >
              <el-option
                v-for="t in questionTypes"
                :key="t.id"
                :label="t.label"
                :value="t.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-collapse-transition>

      <div class="list-divider" />

      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="goCreate">
            <el-icon><Plus /></el-icon>新增题目
          </el-button>
          <el-button
            type="danger"
            plain
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-tag v-if="totalCount > 0" type="info" size="large" class="count-tag">
            已选择 {{ selectedIds.length }} / 共 {{ totalCount }}
          </el-tag>
          <el-popover
            placement="bottom-end"
            :width="240"
            trigger="click"
            popper-class="question-col-popover"
          >
            <template #reference>
              <el-button>
                <el-icon><Setting /></el-icon>列选项
              </el-button>
            </template>
            <div class="col-options">
              <div class="col-options-title">显示列</div>
              <el-checkbox-group v-model="visibleCols">
                <div v-for="c in colDefs" :key="c.key" class="col-option-item">
                  <el-checkbox :value="c.key" :label="c.key">
                    {{ c.label }}
                  </el-checkbox>
                </div>
              </el-checkbox-group>
              <el-divider style="margin: 10px 0" />
              <div class="col-options-footer">
                <el-button size="small" @click="resetCols">
                  <el-icon><Refresh /></el-icon>恢复默认
                </el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="list"
        stripe
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column v-if="visibleCols.includes('id')" prop="id" label="ID" width="80" align="center" />
        <el-table-column v-if="visibleCols.includes('section')" label="板块" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="sectionTag(row.type_section)">
              {{ sectionLabel(row.type_section) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleCols.includes('type')" label="题型" width="180">
          <template #default="{ row }">
            <div class="type-cell">
              <div class="type-label-en">{{ row.type_label }}</div>
              <div class="type-label-zh">{{ typeZhLabel(row) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="visibleCols.includes('title')" label="标题" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="title-cell">{{ row.title }}</div>
            <div class="title-meta">
              <el-tag
                v-if="row.purpose"
                :type="purposeTagType(row.purpose)"
                size="small"
                effect="light"
                round
              >
                {{ purposeLabel(row.purpose) }}
              </el-tag>
              <el-tag
                v-if="row.difficulty"
                size="small"
                effect="plain"
                :type="difficultyTag(row.difficulty)"
              >
                难度 {{ row.difficulty }}
              </el-tag>
              <el-tag
                v-if="row.exam_type"
                size="small"
                type="info"
                effect="plain"
              >
                {{ examTypeLabel(row.exam_type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="visibleCols.includes('machine_source')"
          prop="machine_source"
          label="机经来源"
          width="140"
          show-overflow-tooltip
        />
        <el-table-column
          v-if="visibleCols.includes('machine_exam_date')"
          prop="machine_exam_date"
          label="机经日期"
          width="120"
          align="center"
        />
        <el-table-column v-if="visibleCols.includes('created_at')" label="创建时间" width="170" align="center">
          <template #default="{ row }">
            {{ formatLocalTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goEdit(row.id)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Setting, Refresh } from '@element-plus/icons-vue'
import { getQuestionList, getQuestionSections, getQuestionTypes, deleteQuestions } from '@/api/question'
import type { Question, QuestionQuery, QuestionType, QuestionSection } from '@/types'
import { EXAM_TYPES, examTypeLabel } from '@/constants/exam'
import { QUESTION_PURPOSES, purposeLabel, purposeTagType } from '@/constants/purpose'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const list = ref<Question[]>([])
const totalCount = ref(0)
const questionTypes = ref<QuestionType[]>([])
const sections = ref<QuestionSection[]>([])
const selectedIds = ref<number[]>([])
const advancedOpen = ref(false)

const COL_STORAGE_KEY = 'pte-admin-qlist-cols-v1'
interface ColDef {
  key: string
  label: string
}
const colDefs: ColDef[] = [
  { key: 'id', label: 'ID' },
  { key: 'section', label: '板块' },
  { key: 'type', label: '题型' },
  { key: 'title', label: '标题' },
  { key: 'machine_source', label: '机经来源' },
  { key: 'machine_exam_date', label: '机经日期' },
  { key: 'created_at', label: '创建时间' },
]
const defaultCols = colDefs.map((c) => c.key)

function readVisibleCols(): string[] {
  try {
    const raw = localStorage.getItem(COL_STORAGE_KEY)
    if (!raw) return [...defaultCols]
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return [...defaultCols]
    const filtered = arr.filter((k) => typeof k === 'string' && defaultCols.includes(k))
    return filtered.length ? filtered : [...defaultCols]
  } catch (e) {
    return [...defaultCols]
  }
}

const visibleCols = ref<string[]>(readVisibleCols())

function resetCols() {
  visibleCols.value = [...defaultCols]
}

watch(
  visibleCols,
  (newVal, oldVal) => {
    if (!Array.isArray(newVal)) {
      visibleCols.value = [...defaultCols]
      return
    }
    if (newVal.length === 0 && oldVal && oldVal.length) {
      ElMessage.warning('至少保留一列')
      visibleCols.value = [...oldVal]
      return
    }
    const deduped = Array.from(new Set(newVal.filter((k) => defaultCols.includes(k))))
    if (deduped.length !== newVal.length || JSON.stringify(deduped) !== JSON.stringify(newVal)) {
      visibleCols.value = deduped.length ? deduped : [...defaultCols]
      return
    }
    try {
      localStorage.setItem(COL_STORAGE_KEY, JSON.stringify(newVal))
    } catch (e) {
      // ignore
    }
  },
  { deep: true },
)

function pad2(n: number): string {
  return n < 10 ? '0' + n : String(n)
}

function formatLocalTime(v: string | null | undefined): string {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  const y = d.getFullYear()
  const mo = pad2(d.getMonth() + 1)
  const da = pad2(d.getDate())
  const h = pad2(d.getHours())
  const mi = pad2(d.getMinutes())
  return `${y}-${mo}-${da} ${h}:${mi}`
}

const query = reactive<QuestionQuery>({
  page: 1,
  pageSize: 10,
  exam_type: '',
  question_type_id: undefined,
  type_section: '',
  keyword: '',
  purpose: [],
  status: '',
})

function typeZhLabel(row: { question_type_id?: number }): string {
  const id = row.question_type_id
  if (!id) {
    return ''
  } else {
    const hit = questionTypes.value.find((item) => item.id === id)
    if (hit) {
      return hit.title || hit.label_name || ''
    } else {
      return ''
    }
  }
}

const sectionMap: Record<string, string> = {
  speaking: '口语',
  writing: '写作',
  reading: '阅读',
  listening: '听力',
}

function sectionLabel(s: string): string {
  return sectionMap[s] || s
}

type ElTagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

function sectionTag(s: string): ElTagType {
  if (s === 'speaking') {
    return 'danger'
  } else if (s === 'writing') {
    return 'warning'
  } else if (s === 'reading') {
    return 'success'
  } else if (s === 'listening') {
    return 'primary'
  } else {
    return 'info'
  }
}

function difficultyTag(d: number | string | null): ElTagType {
  const n = Number(d) || 0
  if (n <= 2) {
    return 'success'
  } else if (n <= 4) {
    return 'warning'
  } else if (n <= 6) {
    return 'danger'
  } else {
    return 'info'
  }
}

async function loadMeta() {
  try {
    const examType = query.exam_type ? String(query.exam_type) : undefined
    const [tRes, sRes] = await Promise.all([
      getQuestionTypes(examType ? { exam_type: examType } : undefined),
      getQuestionSections(),
    ])
    questionTypes.value = tRes.data
    sections.value = sRes.data
    if (
      query.question_type_id !== undefined &&
      query.question_type_id !== null &&
      !questionTypes.value.some((t) => t.id === query.question_type_id)
    ) {
      ElMessage.warning('当前考试类型下已移除原先选择的题型，已自动清空')
      query.question_type_id = undefined
    }
  } catch (e) {
    // ignore
  }
}

async function handleExamTypeChangeOnList() {
  await loadMeta()
  loadList()
}

function onPurposeChange() {
  query.page = 1
  loadList()
}

async function loadList() {
  loading.value = true
  try {
    const res = await getQuestionList(query)
    list.value = res.data.list
    totalCount.value = res.data.total
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.page = 1
  query.pageSize = 10
  query.exam_type = ''
  query.question_type_id = undefined
  query.type_section = ''
  query.keyword = ''
  query.purpose = []
  query.status = ''
  loadList()
}

function handleSelectionChange(rows: Question[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function goCreate() {
  router.push('/questions/create')
}

function goEdit(id: number) {
  router.push(`/questions/edit/${id}`)
}

async function handleDelete(row: Record<PropertyKey, any>) {
  try {
    await ElMessageBox.confirm(`确定要删除题目「${row.title}」吗？此操作不可恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    await deleteQuestions([row.id])
    ElMessage.success('删除成功')
    loadList()
  } catch (e) {
    // cancelled or error
  }
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条题目吗？此操作不可恢复。`,
      '批量删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' },
    )
    await deleteQuestions(selectedIds.value)
    ElMessage.success('删除成功')
    loadList()
  } catch (e) {
    // cancelled or error
  }
}

onMounted(() => {
  if (route.query.type_section) {
    query.type_section = String(route.query.type_section)
  }
  loadMeta().then(loadList)
})

watch(
  () => route.query.type_section,
  (v) => {
    if (v !== undefined) {
      query.type_section = String(v)
      loadList()
    }
  },
)
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;

  &-left,
  &-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.count-tag {
  margin-right: 0;
}

.list-divider {
  height: 1px;
  margin: 4px 0 8px;
  background-color: #ebeef5;
}

.filter-bar {
  margin-bottom: 12px;

  &.advanced-filter {
    padding: 14px 16px 2px;
    margin-bottom: 16px;
    background-color: #fafafa;
    border: 1px dashed #ebeef5;
    border-radius: 6px;
  }
}

:deep(.el-collapse-transition-enter-active),
:deep(.el-collapse-transition-leave-active) {
  transition: opacity 0.2s, transform 0.2s;
}

:deep(.question-col-popover .el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.col-options {
  .col-options-title {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .col-option-item {
    display: flex;
    align-items: center;
    padding: 2px 0;
  }

  .col-options-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 2px;
  }
}

.type-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.type-label-en {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

.type-label-zh {
  font-size: 12px;
  color: #909399;
}

.title-cell {
  font-size: 14px;
  color: #303133;
  margin-bottom: 6px;
  font-weight: 500;
}

.title-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
