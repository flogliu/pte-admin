<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-total">
          <div class="stat-icon-wrap">
            <el-icon :size="28"><Notebook /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">题目总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-high">
          <div class="stat-icon-wrap">
            <el-icon :size="28"><Promotion /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.real }}</div>
            <div class="stat-label">真题</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-practice">
          <div class="stat-icon-wrap">
            <el-icon :size="28"><EditPen /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.practice }}</div>
            <div class="stat-label">练习</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover" class="stat-card stat-predict">
          <div class="stat-icon-wrap">
            <el-icon :size="28"><Finished /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.mock }}</div>
            <div class="stat-label">模考</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="quick-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="welcome-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">欢迎使用 PTE 教师管理平台</span>
            </div>
          </template>
          <div class="welcome-body">
            <h3>你好，{{ userStore.nickname || '老师' }}！</h3>
            <p>这里是 PTE 题库管理后台，你可以：</p>
            <ul class="welcome-list">
              <li><el-icon><Notebook /></el-icon> 录入与管理 PTE 核心题库（听说读写）</li>
              <li><el-icon><TrendCharts /></el-icon> 标记真题、练习、模考用途池</li>
              <li><el-icon><Document /></el-icon> 关联机经来源、考试日期、备注</li>
              <li><el-icon><Setting /></el-icon> 配置题目 meta（音频、图片、参考答案等）</li>
            </ul>
            <div class="welcome-actions">
              <el-button type="primary" @click="goToCreate">
                <el-icon><Plus /></el-icon>立即录入题目
              </el-button>
              <el-button @click="goToList">
                <el-icon><List /></el-icon>浏览题库
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">题型板块（Sections）</span>
              <el-tag size="small" type="info">{{ sections.length }} 个板块</el-tag>
            </div>
          </template>
          <div v-loading="loading" class="sections-body">
            <el-empty v-if="!loading && sections.length === 0" description="暂无题型数据" />
            <div v-else class="section-grid">
              <div
                v-for="s in sections"
                :key="s.key"
                class="section-item"
                @click="goToListWithSection(s.key)"
              >
                <div class="section-key">{{ s.key }}</div>
                <div class="section-label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  EditPen,
  Finished,
  List,
  Notebook,
  Plus,
  Promotion,
  Setting,
  TrendCharts,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import { getQuestionList, getQuestionSections } from '@/api/question'
import type { QuestionSection } from '@/types'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const sections = ref<QuestionSection[]>([])
const stats = reactive({
  total: 0,
  real: 0,
  practice: 0,
  mock: 0,
})

async function loadDashboard() {
  loading.value = true
  try {
    const [totalRes, realRes, practiceRes, mockRes, sectionsRes] = await Promise.all([
      getQuestionList({ pageSize: 1 }),
      getQuestionList({ pageSize: 1, purpose: 'real' }),
      getQuestionList({ pageSize: 1, purpose: 'practice' }),
      getQuestionList({ pageSize: 1, purpose: 'mock' }),
      getQuestionSections(),
    ])
    stats.total = totalRes.data.total ?? 0
    stats.real = realRes.data.total ?? 0
    stats.practice = practiceRes.data.total ?? 0
    stats.mock = mockRes.data.total ?? 0
    sections.value = sectionsRes.data
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

function goToCreate() {
  router.push('/questions/create')
}

function goToList() {
  router.push('/questions/list')
}

function goToListWithSection(key: string) {
  router.push({ path: '/questions/list', query: { type_section: key } })
}

onMounted(loadDashboard)
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  border: none;
  margin-bottom: 20px;

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }
}

.stat-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.stat-total .stat-icon-wrap {
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.stat-high .stat-icon-wrap {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}
.stat-practice .stat-icon-wrap {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}
.stat-predict .stat-icon-wrap {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-info {
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
}

.welcome-card {
  height: 100%;
}

.welcome-body {
  h3 {
    margin: 0 0 12px;
    font-size: 18px;
    color: #303133;
  }
  p {
    margin: 0 0 12px;
    color: #606266;
  }
}

.welcome-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #606266;
    font-size: 14px;

    .el-icon {
      color: #409eff;
    }
  }
}

.welcome-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.quick-row {
  margin-bottom: 20px;
}

.sections-body {
  min-height: 200px;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.section-item {
  padding: 16px 12px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    border-color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }
}

.section-key {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.section-label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
</style>
