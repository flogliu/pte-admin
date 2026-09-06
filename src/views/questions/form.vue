<template>
  <div class="page-container">
    <div class="page-card form-card">
      <div class="form-header">
        <div class="header-left">
          <el-button link :icon="ArrowLeft" @click="handleBack">返回列表</el-button>
          <el-divider direction="vertical" />
          <h2 class="form-title">
            {{ isEdit ? '编辑题目' : '新增题目' }}
          </h2>
          <el-tag v-if="isEdit" size="small" type="info" class="form-id-tag">
            题目 ID: {{ form.id }}
          </el-tag>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ submitting ? t('common.saving') : t('common.save') }}
            </el-button>
          </div>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="110px"
        v-loading="loading"
      >
        <el-tabs v-model="activeTab" class="question-form-tabs">
          <el-tab-pane label="基础信息" name="basic">
            <el-form-item label="题库类型" prop="purpose">
              <el-radio-group v-model="form.purpose">
                <el-radio
                  v-for="item in QUESTION_PURPOSES"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :xs="24" :md="12">
                <el-form-item label="考试类型" prop="exam_type">
                  <el-select
                    v-model="form.exam_type"
                    style="width: 100%"
                    placeholder="请选择考试类型"
                    :disabled="isEdit"
                    @change="handleExamTypeChangeOnForm"
                  >
                    <el-option
                      v-for="e in EXAM_TYPES"
                      :key="e.value"
                      :label="e.label"
                      :value="e.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="题型" prop="question_type_id">
              <el-select
                v-model="form.question_type_id"
                placeholder="选择题型（按板块分组）"
                filterable
                style="width: 100%"
                :disabled="isEdit"
                @change="handleTypeChange"
              >
                <el-option-group
                  v-for="group in typeGroups"
                  :key="group.section"
                  :label="group.label"
                >
                  <el-option
                    v-for="t in group.items"
                    :key="t.id"
                    :label="t.label"
                    :value="t.id"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>

            <div v-if="!hasTypeSelected" class="type-empty">
              <el-empty description="请先选择考试类型和题型，再填写题目内容" />
            </div>

            <template v-else-if="isContentAudioType">
              <AudioContentFields
                v-model:content-text="metaFields.referenceText"
                v-model:audio-url="metaFields.audioUrl"
                :text-label="contentAudioLabels.textLabel"
                :text-placeholder="contentAudioLabels.textPlaceholder"
                :audio-label="contentAudioLabels.audioLabel"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isDescribeImage">
              <DescribeImageFields
                v-model:image-url="metaFields.imageUrl"
                v-model:reference-text="metaFields.referenceText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isRespondToSituation">
              <RespondSituationFields
                v-model:situation-text="metaFields.situationText"
                v-model:model-answer-text="metaFields.referenceText"
                v-model:model-audio-url="metaFields.audioUrl"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isAnswerShortQuestion">
              <AnswerShortQuestionFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:answer-text="metaFields.answerText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isRetellLecture">
              <RetellLectureFields
                v-model:title="form.title"
                v-model:image-url="metaFields.imageUrl"
                v-model:video-url="metaFields.videoUrl"
                v-model:audio-url="metaFields.audioUrl"
                v-model:model-answer-text="metaFields.referenceText"
                v-model:model-audio-url="metaFields.referenceAudioUrl"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isSummarizeGroupDiscussion">
              <SummarizeGroupDiscussionFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="metaFields.transcript"
                v-model:model-answer-text="metaFields.referenceText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isSummarizeWrittenText">
              <SummarizeWrittenTextFields
                v-model:passage-text="form.content"
                v-model:model-answer-text="metaFields.referenceText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isWriteEmail">
              <WriteEmailFields
                v-model:scenario-text="form.content"
                v-model:sample-email-text="metaFields.referenceText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isWriteEssay">
              <WriteEssayFields
                v-model:prompt-text="form.content"
                v-model:sample-essay-text="metaFields.referenceText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isReadingRwFib">
              <ReadingRwFibFields
                v-model:title="form.title"
                v-model:passage-text="form.content"
                v-model:blanks="metaFields.fibBlanks"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isReadingMcMultiple">
              <ReadingMcMultipleFields
                v-model:title="form.title"
                v-model:question-text="metaFields.questionText"
                v-model:content-text="form.content"
                v-model:options="metaFields.mcOptions"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isReadingMcSingle">
              <ReadingMcMultipleFields
                v-model:title="form.title"
                v-model:question-text="metaFields.questionText"
                v-model:content-text="form.content"
                v-model:options="metaFields.mcOptions"
                :single-select="true"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isReadingReorder">
              <ReadingReorderFields v-model:paragraphs="metaFields.reorderParagraphs" />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isReadingFibDrag">
              <ReadingFibDragFields
                v-model:title="form.title"
                v-model:passage-text="form.content"
                v-model:blanks="metaFields.fibDragBlanks"
                v-model:word-bank="metaFields.fibDragWordBank"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isSummarizeSpokenText">
              <SummarizeSpokenTextFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="metaFields.transcript"
                v-model:model-summary-text="metaFields.referenceText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningMcMultiple">
              <ListeningMcMultipleFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="metaFields.transcript"
                v-model:options="metaFields.mcOptions"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningMcSingle">
              <ListeningMcMultipleFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="metaFields.transcript"
                v-model:options="metaFields.mcOptions"
                :single-select="true"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningFibL">
              <ListeningFibLFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="form.content"
                v-model:blanks="metaFields.fibDragBlanks"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningHiw">
              <ListeningHiwFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="form.content"
                v-model:incorrect-words="metaFields.hiwIncorrectWords"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningHcs">
              <ListeningMcMultipleFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="metaFields.transcript"
                v-model:options="metaFields.mcOptions"
                :single-select="true"
                :transcript-required="true"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningSmw">
              <ListeningMcMultipleFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:transcript="metaFields.transcript"
                v-model:options="metaFields.mcOptions"
                :single-select="true"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else-if="isListeningWfd">
              <ListeningWfdFields
                v-model:audio-url="metaFields.audioUrl"
                v-model:answer-text="metaFields.answerText"
              />
              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>

            <template v-else>
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="form.title"
                  placeholder="请输入题目标题（用于列表快速识别）"
                  maxlength="255"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="内容" prop="content">
                <el-input
                  v-model="form.content"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入题目文本内容（如阅读文章、写作题干、口语提示等）"
                />
              </el-form-item>

              <el-row :gutter="20">
                <el-col :xs="24" :md="12">
                  <el-form-item label="参考答案">
                    <el-input
                      v-model="metaFields.referenceText"
                      type="textarea"
                      :rows="8"
                      placeholder="标准参考答案 / 范文文本"
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="12">
                  <el-form-item label="听力转录">
                    <el-input
                      v-model="metaFields.transcript"
                      type="textarea"
                      :rows="8"
                      placeholder="听力题 / 口语题对应文本（SST / WFD / RL 等）"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-collapse v-model="metaCollapseNames" class="meta-collapse">
                <el-collapse-item title="媒体与 Meta JSON" name="meta">
                  <div class="meta-section">
                    <el-form-item label="音频 URL">
                      <el-input
                        v-model="metaFields.audioUrl"
                        placeholder="https://.../audio.mp3"
                        clearable
                      />
                    </el-form-item>
                    <el-form-item label="使用 Azure TTS">
                      <el-switch v-model="metaFields.useAzureTts" />
                      <span class="hint-text" style="margin-left: 8px">
                        开启后由 TTS 合成音频（优先于音频 URL）
                      </span>
                    </el-form-item>
                    <el-form-item label="图片 URL">
                      <el-input
                        v-model="metaFields.imageUrl"
                        placeholder="https://.../image.png"
                        clearable
                      />
                    </el-form-item>
                    <el-form-item label="Meta JSON">
                      <div class="meta-json-row">
                        <el-input
                          v-model="metaJsonText"
                          type="textarea"
                          :rows="8"
                          placeholder="完整的 meta JSON，可直接手工编辑"
                          class="meta-json-textarea"
                        />
                        <div class="meta-json-actions">
                          <el-button @click="applyMetaFromFields">从表单同步</el-button>
                          <el-button type="primary" @click="loadMetaToFields">解析到表单</el-button>
                          <el-button type="warning" plain @click="handleResetMeta">清空</el-button>
                        </div>
                      </div>
                      <div v-if="metaJsonError" class="error-tip">
                        <el-icon><WarningFilled /></el-icon> {{ metaJsonError }}
                      </div>
                    </el-form-item>
                  </div>
                </el-collapse-item>
              </el-collapse>

              <el-form-item label="状态">
                <el-select v-model="form.status" placeholder="未设置" clearable style="width: 220px">
                  <el-option label="启用" :value="0" />
                  <el-option label="禁用" :value="1" />
                  <el-option label="草稿" :value="2" />
                </el-select>
              </el-form-item>
            </template>
          </el-tab-pane>

          <el-tab-pane label="机经信息" name="machine" :disabled="!hasTypeSelected">
            <QuestionMachineTab :form="form" />
          </el-tab-pane>

          <el-tab-pane label="难度/点拨" name="extra" :disabled="!hasTypeSelected">
            <QuestionExtraTab
              :form="form"
              :meta-fields="metaFields"
            />
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, WarningFilled } from '@element-plus/icons-vue'
import {
  createQuestion,
  getQuestionDetail,
  getQuestionTypes,
  updateQuestion,
} from '@/api/question'
import type { QuestionForm, QuestionType } from '@/types'
import { EXAM_TYPES } from '@/constants/exam'
import { DEFAULT_PURPOSE, QUESTION_PURPOSES } from '@/constants/purpose'
import { COUNTRY_DEFAULT } from '@/constants/country'
import AudioContentFields from './components/AudioContentFields.vue'
import AnswerShortQuestionFields from './components/AnswerShortQuestionFields.vue'
import DescribeImageFields from './components/DescribeImageFields.vue'
import RespondSituationFields from './components/RespondSituationFields.vue'
import RetellLectureFields from './components/RetellLectureFields.vue'
import SummarizeGroupDiscussionFields from './components/SummarizeGroupDiscussionFields.vue'
import SummarizeWrittenTextFields from './components/SummarizeWrittenTextFields.vue'
import WriteEmailFields from './components/WriteEmailFields.vue'
import WriteEssayFields from './components/WriteEssayFields.vue'
import ReadingRwFibFields from './components/ReadingRwFibFields.vue'
import type { FibBlankDraft } from './components/ReadingRwFibFields.vue'
import ReadingMcMultipleFields from './components/ReadingMcMultipleFields.vue'
import type { McOptionDraft } from './components/ReadingMcMultipleFields.vue'
import ReadingReorderFields from './components/ReadingReorderFields.vue'
import type { ReorderParagraphDraft } from './components/ReadingReorderFields.vue'
import ReadingFibDragFields from './components/ReadingFibDragFields.vue'
import type { FibDragBlankDraft } from './components/ReadingFibDragFields.vue'
import SummarizeSpokenTextFields from './components/SummarizeSpokenTextFields.vue'
import ListeningMcMultipleFields from './components/ListeningMcMultipleFields.vue'
import ListeningFibLFields from './components/ListeningFibLFields.vue'
import ListeningHiwFields from './components/ListeningHiwFields.vue'
import type { HiwIncorrectWordDraft } from './components/ListeningHiwFields.vue'
import ListeningWfdFields from './components/ListeningWfdFields.vue'
import QuestionMachineTab from './components/QuestionMachineTab.vue'
import QuestionExtraTab from './components/QuestionExtraTab.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = computed(() => Number(route.params.id) || 0)
const isEdit = computed(() => id.value > 0)

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const questionTypes = ref<QuestionType[]>([])
const metaJsonError = ref('')
const activeTab = ref('basic')
const metaCollapseNames = ref<string[]>([])

const form = reactive<QuestionForm>({
  id: 0,
  exam_type: 'core',
  question_type_id: null,
  title: '',
  content: '',
  difficulty: null,
  purpose: DEFAULT_PURPOSE,
  status: 0,
  machine_source: COUNTRY_DEFAULT,
  machine_exam_date: '',
  machine_memo: '',
  meta: {},
})

const metaFields = reactive({
  audioUrl: '',
  useAzureTts: false,
  imageUrl: '',
  videoUrl: '',
  referenceText: '',
  referenceAudioUrl: '',
  situationText: '',
  transcript: '',
  answerText: '',
  questionText: '',
  fibBlanks: [] as FibBlankDraft[],
  fibDragBlanks: [] as FibDragBlankDraft[],
  fibDragWordBank: [] as string[],
  reorderParagraphs: [] as ReorderParagraphDraft[],
  mcOptions: [
    { text: '', checked: false },
    { text: '', checked: false },
  ] as McOptionDraft[],
  hiwIncorrectWords: [{ display: '', spoken: '' }] as HiwIncorrectWordDraft[],
  coachingTip: '',
})

const metaJsonText = ref('{}')
const initialSnapshot = ref('')

const isDirty = computed(() => initialSnapshot.value !== buildSnapshot())

const rules = computed<FormRules>(() => {
  const base: FormRules = {
    exam_type: [{ required: true, message: '请选择考试类型', trigger: 'change' }],
    purpose: [{ required: true, message: '请选择题库类型', trigger: 'change' }],
    question_type_id: [
      { required: true, type: 'number', message: '请选择题型', trigger: 'change' },
    ],
  }
  if (
    !isDedicatedFormType.value ||
    isRetellLecture.value ||
    isReadingMcMultiple.value ||
    isReadingMcSingle.value ||
    isReadingRwFib.value ||
    isReadingFibDrag.value
  ) {
    base.title = [{ required: true, message: '请输入标题', trigger: 'blur' }]
  }
  return base
})

const currentType = computed(() => {
  const typeId = form.question_type_id
  if (!typeId) {
    return null
  }
  return questionTypes.value.find((item) => item.id === typeId) || null
})

const hasTypeSelected = computed(() => !!currentType.value)

const isReadAloud = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  }
  return type.code === 'RA' || type.slug === 'read-aloud'
})

const isRepeatSentence = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  }
  return type.code === 'RS' || type.slug === 'repeat-sentence'
})

const isContentAudioType = computed(() => isReadAloud.value || isRepeatSentence.value)

const isDescribeImage = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  }
  return type.code === 'DI' || type.slug === 'describe-image'
})

const isRespondToSituation = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  }
  return type.code === 'RTS' || type.slug === 'respond-to-a-situation'
})

const isAnswerShortQuestion = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  }
  return type.code === 'ASQ' || type.slug === 'answer-short-question'
})

const isRetellLecture = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  }
  return type.code === 'RL' || type.slug === 're-tell-lecture'
})

const isSummarizeGroupDiscussion = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'SGD' || type.slug === 'summarize-group-discussion'
  }
})

const isSummarizeWrittenText = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'SWT' || type.slug === 'summarize-written-text'
  }
})

const isWriteEmail = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'WEM' || type.slug === 'write-email'
  }
})

const isWriteEssay = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'WE' || type.slug === 'write-essay'
  }
})

const isReadingRwFib = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'FIB-RW' || type.slug === 'reading-writing-fill-in-the-blanks'
  }
})

const isReadingMcMultiple = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return (
      type.code === 'MC-CMA-R' ||
      type.slug === 'multiple-choice-choose-multiple-answers-reading'
    )
  }
})

const isReadingMcSingle = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return (
      type.code === 'MC-CSA-R' ||
      type.slug === 'multiple-choice-choose-single-answer-reading'
    )
  }
})

const isReadingReorder = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'RO' || type.slug === 're-order-paragraphs'
  }
})

const isReadingFibDrag = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'FIB-R' || type.slug === 'reading-fill-in-the-blanks'
  }
})

const isSummarizeSpokenText = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'SST' || type.slug === 'summarize-spoken-text'
  }
})

const isListeningMcMultiple = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return (
      type.code === 'MC-CMA-L' ||
      type.slug === 'multiple-choice-choose-multiple-answers-listening'
    )
  }
})

const isListeningMcSingle = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return (
      type.code === 'MC-CSA-L' ||
      type.slug === 'multiple-choice-choose-single-answer-listening'
    )
  }
})

const isListeningFibL = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'FIB-L' || type.slug === 'fill-in-the-blanks-listening'
  }
})

const isListeningHiw = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'HIW' || type.slug === 'highlight-incorrect-words'
  }
})

const isListeningHcs = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'HCS' || type.slug === 'highlight-correct-summary'
  }
})

const isListeningSmw = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'SMW' || type.slug === 'select-missing-word'
  }
})

const isListeningWfd = computed(() => {
  const type = currentType.value
  if (!type) {
    return false
  } else {
    return type.code === 'WFD' || type.slug === 'write-from-dictation'
  }
})

const isDedicatedFormType = computed(
  () =>
    isContentAudioType.value ||
    isDescribeImage.value ||
    isRespondToSituation.value ||
    isAnswerShortQuestion.value ||
    isRetellLecture.value ||
    isSummarizeGroupDiscussion.value ||
    isSummarizeWrittenText.value ||
    isWriteEmail.value ||
    isWriteEssay.value ||
    isReadingRwFib.value ||
    isReadingMcMultiple.value ||
    isReadingMcSingle.value ||
    isReadingReorder.value ||
    isReadingFibDrag.value ||
    isSummarizeSpokenText.value ||
    isListeningMcMultiple.value ||
    isListeningMcSingle.value ||
    isListeningFibL.value ||
    isListeningHiw.value ||
    isListeningHcs.value ||
    isListeningSmw.value ||
    isListeningWfd.value,
)

const contentAudioLabels = computed(() => {
  if (isRepeatSentence.value) {
    return {
      textLabel: '句子内容',
      textPlaceholder: '输入需要复述的英文句子',
      audioLabel: '题目音频',
      emptyError: '请填写句子内容',
    }
  }
  return {
    textLabel: '朗读文本',
    textPlaceholder: '输入需要朗读的英文段落',
    audioLabel: '母语者音频',
    emptyError: '请填写朗读内容',
  }
})

const sectionMap: Record<string, string> = {
  speaking: '口语 Speaking',
  writing: '写作 Writing',
  reading: '阅读 Reading',
  listening: '听力 Listening',
}

const typeGroups = computed(() => {
  const groups: Record<string, { section: string; label: string; items: QuestionType[] }> = {}
  for (const t of questionTypes.value) {
    const sec = t.section || 'other'
    if (!groups[sec]) {
      groups[sec] = {
        section: sec,
        label: sectionMap[sec] || sec,
        items: [],
      }
    }
    groups[sec].items.push(t)
  }
  const order = ['speaking', 'writing', 'reading', 'listening']
  const sorted = order.filter((s) => groups[s]).map((s) => groups[s])
  const others = Object.keys(groups).filter((k) => !order.includes(k)).map((k) => groups[k])
  return [...sorted, ...others]
})

function handleTypeChange() {
  activeTab.value = 'basic'
  if (isEdit.value) {
    return
  }
  resetMeta()
  if (isContentAudioType.value) {
    metaFields.useAzureTts = false
  }
}

function goBack() {
  router.push('/questions/list')
}

function buildSnapshot(): string {
  return JSON.stringify({
    exam_type: form.exam_type,
    question_type_id: form.question_type_id,
    title: form.title,
    content: form.content,
    difficulty: form.difficulty,
    purpose: form.purpose,
    status: form.status,
    machine_source: form.machine_source,
    machine_exam_date: form.machine_exam_date,
    machine_memo: form.machine_memo,
    metaFields: {
      audioUrl: metaFields.audioUrl,
      useAzureTts: metaFields.useAzureTts,
      imageUrl: metaFields.imageUrl,
      videoUrl: metaFields.videoUrl,
      referenceText: metaFields.referenceText,
      referenceAudioUrl: metaFields.referenceAudioUrl,
      situationText: metaFields.situationText,
      transcript: metaFields.transcript,
      answerText: metaFields.answerText,
      questionText: metaFields.questionText,
      fibBlanks: metaFields.fibBlanks,
      fibDragBlanks: metaFields.fibDragBlanks,
      fibDragWordBank: metaFields.fibDragWordBank,
      reorderParagraphs: metaFields.reorderParagraphs,
      mcOptions: metaFields.mcOptions,
      hiwIncorrectWords: metaFields.hiwIncorrectWords,
      coachingTip: metaFields.coachingTip,
    },
    metaJsonText: metaJsonText.value.trim(),
  })
}

function captureSnapshot() {
  initialSnapshot.value = buildSnapshot()
}

async function confirmCancelIfDirty(): Promise<boolean> {
  if (!isDirty.value) {
    return true
  }
  try {
    await ElMessageBox.confirm(
      t('common.unsavedConfirm'),
      t('common.unsavedTitle'),
      {
        confirmButtonText: t('common.confirmCancel'),
        cancelButtonText: t('common.keepEditing'),
        type: 'warning',
      },
    )
    return true
  } catch {
    return false
  }
}

async function handleCancel() {
  if (!(await confirmCancelIfDirty())) {
    return
  } else {
    goBack()
  }
}

async function handleBack() {
  if (!(await confirmCancelIfDirty())) {
    return
  } else {
    goBack()
  }
}

async function handleResetMeta() {
  const hasMeta =
    metaFields.audioUrl.trim() !== '' ||
    metaFields.useAzureTts ||
    metaFields.imageUrl.trim() !== '' ||
    metaFields.videoUrl.trim() !== '' ||
    metaFields.referenceText.trim() !== '' ||
    metaFields.referenceAudioUrl.trim() !== '' ||
    metaFields.situationText.trim() !== '' ||
    metaFields.transcript.trim() !== '' ||
    metaFields.answerText.trim() !== '' ||
    metaFields.questionText.trim() !== '' ||
    metaFields.fibBlanks.length > 0 ||
    metaFields.fibDragBlanks.length > 0 ||
    metaFields.fibDragWordBank.length > 0 ||
    metaFields.reorderParagraphs.some((item) => item.text.trim() !== '') ||
    metaFields.mcOptions.some((item) => item.text.trim() !== '' || item.checked) ||
    metaFields.hiwIncorrectWords.some(
      (item) => item.display.trim() !== '' || item.spoken.trim() !== '',
    ) ||
    metaFields.coachingTip.trim() !== '' ||
    (metaJsonText.value.trim() !== '' && metaJsonText.value.trim() !== '{}')
  if (hasMeta) {
    try {
      await ElMessageBox.confirm('确定要清空题型配置吗？音频URL、图片、参考答案等都会被清空，此操作不可撤销。', '清空确认', {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch (e) {
      return
    }
  }
  resetMeta()
}

function applyMetaFromFields() {
  const merged: Record<string, any> = {}
  if (metaFields.audioUrl) merged.audioUrl = metaFields.audioUrl
  merged.useAzureTts = !!metaFields.useAzureTts
  if (metaFields.imageUrl) merged.imageUrl = metaFields.imageUrl
  if (metaFields.videoUrl) merged.videoUrl = metaFields.videoUrl
  if (metaFields.referenceText) merged.referenceText = metaFields.referenceText
  if (metaFields.referenceAudioUrl) merged.referenceAudioUrl = metaFields.referenceAudioUrl
  if (metaFields.transcript) merged.transcript = metaFields.transcript
  if (metaFields.answerText) merged.answerText = metaFields.answerText
  if (metaFields.coachingTip.trim()) {
    merged.coachingTip = metaFields.coachingTip.trim()
  } else {
    // strip later
  }
  try {
    const existing = parseMetaJsonSafe()
    const finalObj = { ...existing, ...merged }
    if (!metaFields.coachingTip.trim()) {
      delete finalObj.coachingTip
    } else {
      // keep
    }
    metaJsonText.value = JSON.stringify(finalObj, null, 2)
    metaJsonError.value = ''
  } catch (e: any) {
    metaJsonError.value = '解析失败：' + e.message
  }
}

function loadMetaToFields() {
  try {
    const obj = parseMetaJsonSafe()
    metaFields.audioUrl = obj.audioUrl || ''
    metaFields.useAzureTts = !!obj.useAzureTts
    metaFields.imageUrl = obj.imageUrl || ''
    metaFields.videoUrl = obj.videoUrl || ''
    if (isRepeatSentence.value) {
      metaFields.referenceText = obj.referenceText || obj.ttsText || form.content || ''
    } else if (isDescribeImage.value) {
      metaFields.referenceText = obj.referenceText || form.content || ''
    } else if (isRespondToSituation.value) {
      metaFields.situationText = form.content || ''
      metaFields.referenceText = obj.referenceText || ''
    } else if (isRetellLecture.value) {
      metaFields.referenceText = obj.referenceText || ''
      metaFields.referenceAudioUrl = obj.referenceAudioUrl || ''
    } else if (isSummarizeGroupDiscussion.value) {
      metaFields.referenceText = obj.referenceText || ''
    } else if (isSummarizeWrittenText.value) {
      metaFields.referenceText = obj.referenceText || ''
    } else if (isWriteEmail.value) {
      metaFields.referenceText = obj.referenceText || ''
    } else if (isWriteEssay.value) {
      metaFields.referenceText = obj.referenceText || ''
    } else if (isReadingRwFib.value) {
      loadReadingRwFibFields(obj)
    } else if (
      isReadingMcMultiple.value ||
      isReadingMcSingle.value ||
      isListeningMcMultiple.value ||
      isListeningMcSingle.value ||
      isListeningHcs.value ||
      isListeningSmw.value
    ) {
      loadReadingMcMultipleFields(obj)
    } else if (isReadingReorder.value) {
      loadReadingReorderFields(obj)
    } else if (isReadingFibDrag.value || isListeningFibL.value) {
      loadReadingFibDragFields(obj)
    } else if (isListeningHiw.value) {
      loadListeningHiwFields(obj)
    } else if (isListeningWfd.value) {
      loadListeningWfdFields(obj)
    } else {
      metaFields.referenceText = obj.referenceText || ''
    }
    if (
      isSummarizeSpokenText.value ||
      isSummarizeGroupDiscussion.value ||
      isListeningMcMultiple.value ||
      isListeningMcSingle.value ||
      isListeningHcs.value ||
      isListeningSmw.value
    ) {
      metaFields.transcript = resolveSstTranscript(obj)
    } else {
      metaFields.transcript = obj.transcript || ''
    }
    if (isAnswerShortQuestion.value || isListeningWfd.value) {
      metaFields.answerText = obj.answerText || form.content || ''
    } else {
      metaFields.answerText = obj.answerText || ''
    }
    if (typeof obj.coachingTip === 'string') {
      metaFields.coachingTip = obj.coachingTip
    } else {
      metaFields.coachingTip = ''
    }
    metaJsonError.value = ''
  } catch (e: any) {
    metaJsonError.value = '解析失败：' + e.message
  }
}

function resetMeta() {
  metaJsonText.value = '{}'
  metaFields.audioUrl = ''
  metaFields.useAzureTts = false
  metaFields.imageUrl = ''
  metaFields.videoUrl = ''
  metaFields.referenceText = ''
  metaFields.referenceAudioUrl = ''
  metaFields.situationText = ''
  metaFields.transcript = ''
  metaFields.answerText = ''
  metaFields.questionText = ''
  metaFields.fibBlanks = []
  metaFields.fibDragBlanks = []
  metaFields.fibDragWordBank = []
  metaFields.reorderParagraphs = []
  metaFields.mcOptions = emptyMcOptions()
  metaFields.hiwIncorrectWords = [{ display: '', spoken: '' }]
  metaFields.coachingTip = ''
  metaJsonError.value = ''
}

function parseMetaJsonSafe(): Record<string, any> {
  const text = metaJsonText.value.trim() || '{}'
  const obj = JSON.parse(text)
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('必须是 JSON 对象')
  }
  return obj
}

function cloneMetaObject(meta: unknown): Record<string, any> {
  if (typeof meta === 'string' && meta.trim() !== '') {
    try {
      const parsed = JSON.parse(meta)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ...parsed }
      } else {
        return {}
      }
    } catch {
      return {}
    }
  } else if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    return { ...meta }
  } else {
    return {}
  }
}

function attachCoachingTip(meta: unknown): Record<string, any> {
  const tip = metaFields.coachingTip.trim()
  const obj = cloneMetaObject(meta)
  if (tip) {
    obj.coachingTip = tip
  } else {
    delete obj.coachingTip
  }
  return obj
}

watch(metaJsonText, (v) => {
  if (!v || v.trim() === '') {
    metaJsonError.value = ''
    return
  }
  try {
    parseMetaJsonSafe()
    metaJsonError.value = ''
  } catch (e: any) {
    metaJsonError.value = 'JSON 格式无效：' + e.message
  }
})

function buildMetaPayload(): Record<string, any> | string {
  const text = metaJsonText.value.trim()
  if (text === '') return {}
  try {
    return parseMetaJsonSafe()
  } catch {
    return text
  }
}

async function loadMeta(examType?: string) {
  const res = await getQuestionTypes(examType ? { exam_type: examType } : undefined)
  questionTypes.value = res.data
  const currentId = form.question_type_id
  if (
    currentId !== null &&
    currentId !== undefined &&
    currentId !== 0 &&
    !questionTypes.value.some((t) => t.id === currentId)
  ) {
    ElMessage.warning('当前考试类型不支持该题型，已清空已选择题型')
    form.question_type_id = null
  }
}

async function handleExamTypeChangeOnForm() {
  const examType = form.exam_type ? String(form.exam_type) : undefined
  await loadMeta(examType)
}

async function loadForEdit() {
  loading.value = true
  try {
    const res = await getQuestionDetail(id.value)
    const q = res.data
    form.id = q.id
    form.exam_type = q.exam_type || 'core'
    form.question_type_id = q.question_type_id || null
    await loadMeta(form.exam_type || undefined)
    form.title = q.title || ''
    form.content = q.content || ''
    form.difficulty = typeof q.difficulty === 'number' ? q.difficulty : null
    form.purpose = q.purpose || DEFAULT_PURPOSE
    form.status = typeof q.status === 'number' ? q.status : null
    form.machine_source = q.machine_source || ''
    form.machine_exam_date = q.machine_exam_date || ''
    form.machine_memo = q.machine_memo || ''
    let metaObj: Record<string, any> = {}
    if (typeof q.meta === 'string' && q.meta.trim() !== '') {
      try {
        metaObj = JSON.parse(q.meta)
      } catch {
        metaObj = {}
      }
    } else if (typeof q.meta === 'object' && q.meta !== null) {
      metaObj = q.meta as Record<string, any>
    }
    metaJsonText.value = JSON.stringify(metaObj, null, 2)
    loadMetaToFields()
    captureSnapshot()
  } finally {
    loading.value = false
  }
}

function buildTitleFromContent(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 10) {
    return words.join(' ')
  }
  return `${words.slice(0, 10).join(' ')}...`
}

function buildContentAudioMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const text = metaFields.referenceText.trim()
  if (text) {
    meta.referenceText = text
  }
  const audioUrl = metaFields.audioUrl.trim()
  if (audioUrl) {
    meta.audioUrl = audioUrl
  }
  return meta
}

function buildContentAudioPayload(): Record<string, any> {
  const text = metaFields.referenceText.trim()
  if (!text) {
    throw new Error(contentAudioLabels.value.emptyError)
  }
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(text),
    content: text,
    meta: buildContentAudioMeta(),
  }
}

function buildDescribeImageMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const imageUrl = metaFields.imageUrl.trim()
  if (imageUrl) {
    meta.imageUrl = imageUrl
  }
  const text = metaFields.referenceText.trim()
  if (text) {
    meta.referenceText = text
  }
  return meta
}

function buildFormExtras(): Record<string, any> {
  return {
    exam_type: form.exam_type,
    question_type_id: form.question_type_id,
    difficulty: form.difficulty ?? null,
    purpose: form.purpose || DEFAULT_PURPOSE,
    status: form.status ?? null,
    machine_source: form.machine_source || null,
    machine_exam_date: form.machine_exam_date || null,
    machine_memo: form.machine_memo || null,
  }
}

function buildRespondSituationMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const modelAnswerText = metaFields.referenceText.trim()
  if (modelAnswerText) {
    meta.referenceText = modelAnswerText
  }
  const audioUrl = metaFields.audioUrl.trim()
  if (audioUrl) {
    meta.audioUrl = audioUrl
  }
  return meta
}

function buildRespondSituationPayload(): Record<string, any> {
  const text = metaFields.situationText.trim()
  if (!text) {
    throw new Error('请填写情景描述')
  }
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(text),
    content: text,
    meta: buildRespondSituationMeta(),
  }
}

function buildAnswerShortQuestionMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const audioUrl = metaFields.audioUrl.trim()
  const answerText = metaFields.answerText.trim()
  if (audioUrl) {
    meta.audioUrl = audioUrl
  }
  if (answerText) {
    meta.answerText = answerText
  }
  return meta
}

function buildAnswerShortQuestionPayload(): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  if (!audioUrl) {
    throw new Error('请上传问题录音')
  }
  const answerText = metaFields.answerText.trim()
  if (!answerText) {
    throw new Error('请填写答案')
  }
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(answerText),
    content: answerText,
    meta: buildAnswerShortQuestionMeta(),
  }
}

function hasRetellLectureMaterial(): boolean {
  return !!(
    metaFields.imageUrl.trim() ||
    metaFields.videoUrl.trim() ||
    metaFields.audioUrl.trim()
  )
}

function buildRetellLectureMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const imageUrl = metaFields.imageUrl.trim()
  const videoUrl = metaFields.videoUrl.trim()
  const audioUrl = metaFields.audioUrl.trim()
  if (imageUrl) {
    meta.imageUrl = imageUrl
  }
  if (videoUrl) {
    meta.videoUrl = videoUrl
  }
  if (audioUrl) {
    meta.audioUrl = audioUrl
  }
  const referenceText = metaFields.referenceText.trim()
  if (referenceText) {
    meta.referenceText = referenceText
  }
  const referenceAudioUrl = metaFields.referenceAudioUrl.trim()
  if (referenceAudioUrl) {
    meta.referenceAudioUrl = referenceAudioUrl
  }
  return meta
}

function buildRetellLecturePayload(): Record<string, any> {
  const title = form.title.trim()
  if (!title) {
    throw new Error('请输入标题')
  }
  if (!hasRetellLectureMaterial()) {
    throw new Error('请至少上传一项提示素材')
  }
  return {
    ...buildFormExtras(),
    title,
    content: title,
    meta: buildRetellLectureMeta(),
  }
}

function buildSummarizeGroupDiscussionPayload(): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  if (!audioUrl) {
    throw new Error('请上传语音')
  } else {
    return finishSummarizeGroupDiscussionPayload(audioUrl)
  }
}

function finishSummarizeGroupDiscussionPayload(audioUrl: string): Record<string, any> {
  const transcript = metaFields.transcript.trim()
  const modelAnswer = metaFields.referenceText.trim()
  const titleSource = transcript || modelAnswer || 'Summarize Group Discussion'
  const meta: Record<string, string> = { audioUrl }
  if (transcript) {
    meta.transcript = transcript
  }
  if (modelAnswer) {
    meta.referenceText = modelAnswer
  }
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(titleSource),
    content: transcript,
    meta,
  }
}

function buildDescribeImagePayload(): Record<string, any> {
  const imageUrl = metaFields.imageUrl.trim()
  if (!imageUrl) {
    throw new Error('请上传题目图片')
  }
  const text = metaFields.referenceText.trim()
  if (!text) {
    throw new Error('请填写评分参考')
  }
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(text),
    content: text,
    meta: buildDescribeImageMeta(),
  }
}

function buildSummarizeWrittenTextMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const modelAnswer = metaFields.referenceText.trim()
  if (!modelAnswer) {
    return meta
  } else {
    meta.referenceText = modelAnswer
    return meta
  }
}

function buildSummarizeWrittenTextPayload(): Record<string, any> {
  const passage = form.content.trim()
  if (!passage) {
    throw new Error('请填写原文')
  } else {
    return {
      ...buildFormExtras(),
      title: buildTitleFromContent(passage),
      content: passage,
      meta: buildSummarizeWrittenTextMeta(),
    }
  }
}

function buildWriteEmailMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const sampleEmail = metaFields.referenceText.trim()
  if (!sampleEmail) {
    return meta
  } else {
    meta.referenceText = sampleEmail
    return meta
  }
}

function buildWriteEmailPayload(): Record<string, any> {
  const scenario = form.content.trim()
  if (!scenario) {
    throw new Error('请填写邮件内容描述')
  } else {
    return {
      ...buildFormExtras(),
      title: buildTitleFromContent(scenario),
      content: scenario,
      meta: buildWriteEmailMeta(),
    }
  }
}

function buildWriteEssayMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const sampleEssay = metaFields.referenceText.trim()
  if (!sampleEssay) {
    return meta
  } else {
    meta.referenceText = sampleEssay
    return meta
  }
}

function buildWriteEssayPayload(): Record<string, any> {
  const prompt = form.content.trim()
  if (!prompt) {
    throw new Error('请填写题目')
  } else {
    return {
      ...buildFormExtras(),
      title: buildTitleFromContent(prompt),
      content: prompt,
      meta: buildWriteEssayMeta(),
    }
  }
}

function resolveSstTranscript(obj: Record<string, any>): string {
  const fromMeta = String(obj.transcript || obj.ttsText || '').trim()
  if (fromMeta) {
    return fromMeta
  } else {
    return form.content || ''
  }
}

function buildSummarizeSpokenTextMeta(): Record<string, string> {
  const meta: Record<string, string> = {}
  const audioUrl = metaFields.audioUrl.trim()
  const transcript = metaFields.transcript.trim()
  const modelSummary = metaFields.referenceText.trim()
  if (audioUrl) {
    meta.audioUrl = audioUrl
  }
  if (transcript) {
    meta.transcript = transcript
  }
  if (modelSummary) {
    meta.referenceText = modelSummary
  }
  return meta
}

function buildSummarizeSpokenTextPayload(): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  if (!audioUrl) {
    throw new Error('请上传语音')
  } else {
    return finishSummarizeSpokenTextPayload()
  }
}

function finishSummarizeSpokenTextPayload(): Record<string, any> {
  const transcript = metaFields.transcript.trim()
  const modelSummary = metaFields.referenceText.trim()
  const titleSource = transcript || modelSummary || 'Summarize Spoken Text'
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(titleSource),
    content: transcript,
    meta: buildSummarizeSpokenTextMeta(),
  }
}

function buildListeningMcMultiplePayload(): Record<string, any> {
  return buildListeningMcPayload(false)
}

function buildListeningMcSinglePayload(): Record<string, any> {
  return buildListeningMcPayload(true, false)
}

function buildListeningHcsPayload(): Record<string, any> {
  return buildListeningMcPayload(true, true)
}

function buildListeningSmwPayload(): Record<string, any> {
  return buildListeningMcPayload(true, false)
}

function buildListeningMcPayload(
  singleSelect: boolean,
  requireTranscript = false,
): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  const transcript = metaFields.transcript.trim()
  if (!audioUrl) {
    throw new Error('请上传语音')
  } else if (requireTranscript && !transcript) {
    throw new Error('请填写转述文本')
  } else {
    return finishListeningMcPayload(audioUrl, singleSelect)
  }
}

function finishListeningMcPayload(
  audioUrl: string,
  singleSelect: boolean,
): Record<string, any> {
  const rows = buildMcOptionRows()
  if (rows.length < 2) {
    throw new Error('请至少添加 2 个选项')
  } else if (rows.some((item) => !item.text)) {
    throw new Error('请填写完整选项内容')
  } else {
    return assembleListeningMc(audioUrl, rows, singleSelect)
  }
}

function assembleListeningMc(
  audioUrl: string,
  rows: { key: string; text: string; checked: boolean }[],
  singleSelect: boolean,
): Record<string, any> {
  const checkedKeys = rows.filter((item) => item.checked).map((item) => item.key)
  if (singleSelect && checkedKeys.length !== 1) {
    throw new Error('请选择一个正确答案')
  } else if (!singleSelect && checkedKeys.length < 1) {
    throw new Error('请勾选至少一个正确答案')
  } else {
    return packListeningMcMultiple(audioUrl, rows, checkedKeys)
  }
}

function packListeningMcMultiple(
  audioUrl: string,
  rows: { key: string; text: string; checked: boolean }[],
  checkedKeys: string[],
): Record<string, any> {
  const transcript = metaFields.transcript.trim()
  const titleSource = transcript || rows[0]!.text
  const meta: Record<string, any> = {
    audioUrl,
    options: rows.map((item) => ({ key: item.key, text: item.text })),
    correctKeys: checkedKeys,
  }
  if (transcript) {
    meta.transcript = transcript
  }
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(titleSource),
    content: transcript,
    meta,
  }
}

function scanBlankIds(text: string): string[] {
  const ids: string[] = []
  const re = /\{\{(\d+)\}\}/g
  let match = re.exec(text)
  while (match) {
    if (!ids.includes(match[1]!)) {
      ids.push(match[1]!)
    } else {
      // 重复编号不重复建卡片
    }
    match = re.exec(text)
  }
  return ids
}

function normalizePassageMarkers(text: string): string {
  if (!text.includes('#blank#')) {
    return text
  } else {
    let n = 0
    return text.replace(/#blank#/g, () => {
      n += 1
      return `{{${n}}}`
    })
  }
}

function blankDraftFromMeta(raw: Record<string, any>, fallbackId: string): FibBlankDraft {
  const answer = String(raw.answer || '').trim()
  const optionTexts = Array.isArray(raw.options)
    ? raw.options.map((item: any) => String(item?.text || '').trim()).filter(Boolean)
    : []
  const others = optionTexts.filter((text: string) => text !== answer)
  return {
    id: String(raw.id || fallbackId),
    answer,
    distractors: [others[0] || '', others[1] || '', others[2] || ''],
  }
}

function loadReadingRwFibFields(obj: Record<string, any>) {
  const passage = normalizePassageMarkers(form.content || obj.promptText || '')
  form.content = passage
  const ids = scanBlankIds(passage)
  const rawBlanks = Array.isArray(obj.blanks) ? obj.blanks : []
  metaFields.fibBlanks = ids.map((id, index) => {
    const matched = rawBlanks.find((item: Record<string, any>) => String(item?.id) === id)
    const raw = matched || rawBlanks[index] || {}
    return blankDraftFromMeta(raw, id)
  })
}

function buildOneFibBlank(draft: FibBlankDraft) {
  const answer = draft.answer.trim()
  const distractors = draft.distractors.map((item) => item.trim())
  if (!answer) {
    throw new Error(`请填写选择项[${draft.id}] 的答案`)
  } else if (distractors.some((item) => !item)) {
    throw new Error(`请填写选择项[${draft.id}] 的选项`)
  } else {
    return {
      id: draft.id,
      answer,
      correctKey: 'A',
      options: [
        { key: 'A', text: answer },
        { key: 'B', text: distractors[0] },
        { key: 'C', text: distractors[1] },
        { key: 'D', text: distractors[2] },
      ],
    }
  }
}

function buildReadingRwFibPayload(): Record<string, any> {
  const title = form.title.trim()
  const passage = form.content.trim()
  if (!title) {
    throw new Error('请填写标题')
  } else if (!passage) {
    throw new Error('请填写文稿')
  } else {
    return finishReadingRwFibPayload(title, passage)
  }
}

function finishReadingRwFibPayload(title: string, passage: string): Record<string, any> {
  const ids = scanBlankIds(passage)
  if (ids.length < 1) {
    throw new Error('请至少插入一个空 {{1}}')
  } else if (metaFields.fibBlanks.length !== ids.length) {
    throw new Error('空数量与文稿不一致')
  } else {
    const blanks = metaFields.fibBlanks.map((draft) => buildOneFibBlank(draft))
    return {
      ...buildFormExtras(),
      title,
      content: passage,
      meta: { blanks },
    }
  }
}

function emptyMcOptions(): McOptionDraft[] {
  return [
    { text: '', checked: false },
    { text: '', checked: false },
  ]
}

function loadReadingMcMultipleFields(obj: Record<string, any>) {
  metaFields.questionText = obj.promptText || ''
  const correctKeys = Array.isArray(obj.correctKeys) ? obj.correctKeys.map(String) : []
  const rawOptions = Array.isArray(obj.options) ? obj.options : []
  if (rawOptions.length < 2) {
    metaFields.mcOptions = emptyMcOptions()
  } else {
    metaFields.mcOptions = rawOptions.map((item: Record<string, any>) => ({
      text: String(item?.text || ''),
      checked: correctKeys.includes(String(item?.key || '')),
    }))
  }
}

function buildMcOptionRows() {
  const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return metaFields.mcOptions.map((draft, index) => {
    const key = keys.charAt(index) || String(index + 1)
    return {
      key,
      text: draft.text.trim(),
      checked: draft.checked,
    }
  })
}

function buildReadingMcPayload(singleSelect: boolean): Record<string, any> {
  const title = form.title.trim()
  const question = metaFields.questionText.trim()
  const content = form.content.trim()
  if (!title) {
    throw new Error('请填写标题')
  } else if (!question) {
    throw new Error('请填写问题')
  } else if (!content) {
    throw new Error('请填写内容')
  } else {
    return buildReadingMcMeta(title, question, content, singleSelect)
  }
}

function buildReadingMcMeta(
  title: string,
  question: string,
  content: string,
  singleSelect: boolean,
) {
  const rows = buildMcOptionRows()
  if (rows.length < 2) {
    throw new Error('请至少添加 2 个选项')
  } else if (rows.some((item) => !item.text)) {
    throw new Error('请填写完整选项内容')
  } else {
    return finishReadingMcMeta(title, question, content, rows, singleSelect)
  }
}

function finishReadingMcMeta(
  title: string,
  question: string,
  content: string,
  rows: { key: string; text: string; checked: boolean }[],
  singleSelect: boolean,
) {
  const checkedKeys = rows.filter((item) => item.checked).map((item) => item.key)
  if (singleSelect && checkedKeys.length !== 1) {
    throw new Error('请选择一个正确答案')
  } else if (!singleSelect && checkedKeys.length < 1) {
    throw new Error('请勾选至少一个正确答案')
  } else {
    return {
      ...buildFormExtras(),
      title,
      content,
      meta: {
        promptText: question,
        options: rows.map((item) => ({ key: item.key, text: item.text })),
        correctKeys: checkedKeys,
      },
    }
  }
}

function emptyParagraphs(): ReorderParagraphDraft[] {
  return [
    { id: 'p1', text: '' },
    { id: 'p2', text: '' },
  ]
}

function sortParagraphsByOrder(
  raw: Record<string, any>[],
  order: string[],
): ReorderParagraphDraft[] {
  const drafts = raw.map((item, index) => ({
    id: String(item?.id || `p${index + 1}`),
    text: String(item?.text || ''),
  }))
  if (order.length === 0) {
    return drafts
  } else {
    return orderParagraphs(drafts, order)
  }
}

function orderParagraphs(
  drafts: ReorderParagraphDraft[],
  order: string[],
): ReorderParagraphDraft[] {
  const byId = new Map(drafts.map((item) => [item.id, item]))
  const ordered: ReorderParagraphDraft[] = []
  for (const id of order) {
    const found = byId.get(id)
    if (found) {
      ordered.push(found)
      byId.delete(id)
    }
  }
  for (const rest of byId.values()) {
    ordered.push(rest)
  }
  return ordered
}

function loadReadingReorderFields(obj: Record<string, any>) {
  const raw = Array.isArray(obj.paragraphs) ? obj.paragraphs : []
  const order = Array.isArray(obj.correctOrder) ? obj.correctOrder.map(String) : []
  if (raw.length < 2) {
    metaFields.reorderParagraphs = emptyParagraphs()
  } else {
    metaFields.reorderParagraphs = sortParagraphsByOrder(raw, order)
  }
}

function buildReadingReorderPayload(): Record<string, any> {
  const rows = metaFields.reorderParagraphs.map((item, index) => ({
    id: item.id || `p${index + 1}`,
    text: item.text.trim(),
  }))
  if (rows.length < 2) {
    throw new Error('请至少添加 2 个段落')
  } else if (rows.some((item) => !item.text)) {
    throw new Error('请填写完整段落内容')
  } else {
    return {
      ...buildFormExtras(),
      title: buildTitleFromContent(rows[0]!.text),
      content: '',
      meta: {
        paragraphs: rows.map((item) => ({ id: item.id, text: item.text })),
        correctOrder: rows.map((item) => item.id),
      },
    }
  }
}

function uniqueWordBank(answers: string[], extra: string[]): string[] {
  const seen = new Set<string>()
  const words: string[] = []
  for (const item of [...extra, ...answers]) {
    const word = item.trim()
    if (!word || seen.has(word)) {
      continue
    } else {
      seen.add(word)
      words.push(word)
    }
  }
  return words
}

function loadWordBankTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return []
  } else {
    return uniqueWordBank(
      [],
      raw.map((item) => String(item || '')),
    )
  }
}

function loadReadingFibDragFields(obj: Record<string, any>) {
  const passage = normalizePassageMarkers(form.content || obj.promptText || '')
  form.content = passage
  const ids = scanBlankIds(passage)
  const rawBlanks = Array.isArray(obj.blanks) ? obj.blanks : []
  metaFields.fibDragBlanks = ids.map((id, index) => {
    const matched = rawBlanks.find((item: Record<string, any>) => String(item?.id) === id)
    const raw = matched || rawBlanks[index] || {}
    return {
      id,
      answer: String(raw.answer || '').trim(),
    }
  })
  metaFields.fibDragWordBank = loadWordBankTags(obj.wordBank)
}

function buildReadingFibDragPayload(): Record<string, any> {
  const title = form.title.trim()
  const passage = form.content.trim()
  if (!title) {
    throw new Error('请填写标题')
  } else if (!passage) {
    throw new Error('请填写文稿')
  } else {
    return buildReadingFibDragMeta(title, passage)
  }
}

function buildReadingFibDragMeta(title: string, passage: string): Record<string, any> {
  const ids = scanBlankIds(passage)
  if (ids.length < 1) {
    throw new Error('请至少插入一个空 {{1}}')
  } else if (metaFields.fibDragBlanks.length !== ids.length) {
    throw new Error('空数量与文稿不一致')
  } else {
    const blanks = metaFields.fibDragBlanks.map((draft) => buildOneFibDragBlank(draft))
    return {
      ...buildFormExtras(),
      title,
      content: passage,
      meta: {
        blanks,
        wordBank: uniqueWordBank(
          blanks.map((item) => item.answer),
          metaFields.fibDragWordBank,
        ),
      },
    }
  }
}

function buildOneFibDragBlank(draft: FibDragBlankDraft) {
  const answer = draft.answer.trim()
  if (!answer) {
    throw new Error(`请填写空白 ${draft.id} 的答案`)
  } else {
    return {
      id: draft.id,
      answer,
    }
  }
}

function buildListeningFibLPayload(): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  const passage = form.content.trim()
  if (!audioUrl) {
    throw new Error('请上传语音')
  } else if (!passage) {
    throw new Error('请填写转述文本')
  } else {
    return finishListeningFibLPayload(audioUrl, passage)
  }
}

function finishListeningFibLPayload(audioUrl: string, passage: string): Record<string, any> {
  const ids = scanBlankIds(passage)
  if (ids.length < 1) {
    throw new Error('请至少插入一个空 {{1}}')
  } else if (metaFields.fibDragBlanks.length !== ids.length) {
    throw new Error('空数量与文稿不一致')
  } else {
    return packListeningFibL(audioUrl, passage)
  }
}

function packListeningFibL(audioUrl: string, passage: string): Record<string, any> {
  const blanks = metaFields.fibDragBlanks.map((draft) => buildOneFibDragBlank(draft))
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(passage),
    content: passage,
    meta: {
      audioUrl,
      blanks,
    },
  }
}

function normalizeHiwWord(text: string): string {
  return text.trim().replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase()
}

function tokenizeHiwTranscript(transcript: string): string[] {
  return transcript.trim().split(/\s+/).filter(Boolean)
}

function joinHiwTokens(raw: unknown): string {
  if (!Array.isArray(raw)) {
    return ''
  } else {
    return raw.map((item) => String(item?.text || '')).filter(Boolean).join(' ')
  }
}

function loadHiwPairsFromMeta(obj: Record<string, any>): HiwIncorrectWordDraft[] {
  const rawPairs = Array.isArray(obj.incorrectWords) ? obj.incorrectWords : []
  if (rawPairs.length > 0) {
    return rawPairs.map((item: Record<string, any>) => ({
      display: String(item?.display || '').trim(),
      spoken: String(item?.spoken || '').trim(),
    }))
  } else {
    return loadHiwPairsFromTokens(obj.hiwTokens)
  }
}

function loadHiwPairsFromTokens(raw: unknown): HiwIncorrectWordDraft[] {
  if (!Array.isArray(raw)) {
    return [{ display: '', spoken: '' }]
  } else {
    const pairs = raw
      .filter((item) => !!item?.incorrect)
      .map((item) => ({
        display: String(item?.text || '').trim(),
        spoken: '',
      }))
    if (pairs.length > 0) {
      return pairs
    } else {
      return [{ display: '', spoken: '' }]
    }
  }
}

function loadListeningHiwFields(obj: Record<string, any>) {
  const transcript = String(form.content || joinHiwTokens(obj.hiwTokens) || '').trim()
  form.content = transcript
  metaFields.hiwIncorrectWords = loadHiwPairsFromMeta(obj)
}

function buildHiwTokens(
  transcript: string,
  pairs: HiwIncorrectWordDraft[],
): { text: string; incorrect: boolean }[] {
  const displaySet = new Set(
    pairs.map((item) => normalizeHiwWord(item.display)).filter(Boolean),
  )
  return tokenizeHiwTranscript(transcript).map((text) => ({
    text,
    incorrect: displaySet.has(normalizeHiwWord(text)),
  }))
}

function validateHiwPairs(pairs: HiwIncorrectWordDraft[], transcript: string) {
  if (pairs.length < 1) {
    throw new Error('请至少添加一对错误单词')
  }
  const tokens = tokenizeHiwTranscript(transcript).map((item) => normalizeHiwWord(item))
  for (const pair of pairs) {
    const display = pair.display.trim()
    const spoken = pair.spoken.trim()
    if (!display || !spoken) {
      throw new Error('请填写完整的错误单词对')
    } else if (!tokens.includes(normalizeHiwWord(display))) {
      throw new Error(`显示词 "${display}" 不在转述文本中`)
    } else {
      // 校验通过，继续下一对
    }
  }
}

function buildListeningHiwPayload(): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  const transcript = form.content.trim()
  const pairs = metaFields.hiwIncorrectWords.map((item) => ({
    display: item.display.trim(),
    spoken: item.spoken.trim(),
  }))
  if (!audioUrl) {
    throw new Error('请上传语音')
  } else if (!transcript) {
    throw new Error('请填写转述文本')
  } else {
    validateHiwPairs(pairs, transcript)
    return packListeningHiw(audioUrl, transcript, pairs)
  }
}

function packListeningHiw(
  audioUrl: string,
  transcript: string,
  pairs: HiwIncorrectWordDraft[],
): Record<string, any> {
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(transcript),
    content: transcript,
    meta: {
      audioUrl,
      incorrectWords: pairs,
      hiwTokens: buildHiwTokens(transcript, pairs),
    },
  }
}

function loadListeningWfdFields(obj: Record<string, any>) {
  metaFields.audioUrl = obj.audioUrl || ''
  metaFields.answerText = obj.answerText || form.content || ''
}

function buildListeningWfdPayload(): Record<string, any> {
  const audioUrl = metaFields.audioUrl.trim()
  const answerText = metaFields.answerText.trim()
  if (!audioUrl) {
    throw new Error('请上传语音')
  } else if (!answerText) {
    throw new Error('请填写答案')
  } else {
    return packListeningWfd(audioUrl, answerText)
  }
}

function packListeningWfd(audioUrl: string, answerText: string): Record<string, any> {
  return {
    ...buildFormExtras(),
    title: buildTitleFromContent(answerText),
    content: answerText,
    meta: {
      audioUrl,
      answerText,
    },
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (!hasTypeSelected.value) {
    ElMessage.warning('请先选择题型')
    return
  }

  if (metaJsonError.value !== '' && !isDedicatedFormType.value) {
    ElMessage.error('请先修正 Meta JSON 的格式错误')
    return
  }

  let payload: Record<string, any>
  if (isContentAudioType.value) {
    try {
      payload = buildContentAudioPayload()
    } catch (e: any) {
      ElMessage.error(e.message || contentAudioLabels.value.emptyError)
      return
    }
  } else if (isDescribeImage.value) {
    try {
      payload = buildDescribeImagePayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善题目信息')
      return
    }
  } else if (isRespondToSituation.value) {
    try {
      payload = buildRespondSituationPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请填写情景描述')
      return
    }
  } else if (isAnswerShortQuestion.value) {
    try {
      payload = buildAnswerShortQuestionPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善题目信息')
      return
    }
  } else if (isRetellLecture.value) {
    try {
      payload = buildRetellLecturePayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善题目信息')
      return
    }
  } else if (isSummarizeGroupDiscussion.value) {
    try {
      payload = buildSummarizeGroupDiscussionPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善题目信息')
      return
    }
  } else if (isSummarizeWrittenText.value) {
    try {
      payload = buildSummarizeWrittenTextPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请填写原文')
      return
    }
  } else if (isWriteEmail.value) {
    try {
      payload = buildWriteEmailPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请填写邮件内容描述')
      return
    }
  } else if (isWriteEssay.value) {
    try {
      payload = buildWriteEssayPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请填写题目')
      return
    }
  } else if (isSummarizeSpokenText.value) {
    try {
      payload = buildSummarizeSpokenTextPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请上传语音')
      return
    }
  } else if (isListeningMcMultiple.value) {
    try {
      payload = buildListeningMcMultiplePayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善听力多选题')
      return
    }
  } else if (isListeningMcSingle.value) {
    try {
      payload = buildListeningMcSinglePayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善听力单选题')
      return
    }
  } else if (isListeningFibL.value) {
    try {
      payload = buildListeningFibLPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善听力填空')
      return
    }
  } else if (isListeningHiw.value) {
    try {
      payload = buildListeningHiwPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善听力 HIW 题目')
      return
    }
  } else if (isListeningHcs.value) {
    try {
      payload = buildListeningHcsPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善 HCS 题目')
      return
    }
  } else if (isListeningSmw.value) {
    try {
      payload = buildListeningSmwPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善 SMW 题目')
      return
    }
  } else if (isListeningWfd.value) {
    try {
      payload = buildListeningWfdPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善 WFD 题目')
      return
    }
  } else if (isReadingRwFib.value) {
    try {
      payload = buildReadingRwFibPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善填空题目')
      return
    }
  } else if (isReadingMcMultiple.value || isReadingMcSingle.value) {
    try {
      payload = buildReadingMcPayload(isReadingMcSingle.value)
    } catch (e: any) {
      ElMessage.error(e.message || '请完善选择题')
      return
    }
  } else if (isReadingReorder.value) {
    try {
      payload = buildReadingReorderPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善段落排序题目')
      return
    }
  } else if (isReadingFibDrag.value) {
    try {
      payload = buildReadingFibDragPayload()
    } catch (e: any) {
      ElMessage.error(e.message || '请完善填空题目')
      return
    }
  } else {
    payload = {
      exam_type: form.exam_type,
      question_type_id: form.question_type_id,
      title: form.title.trim(),
      content: form.content,
      difficulty: form.difficulty ?? null,
      purpose: form.purpose || DEFAULT_PURPOSE,
      status: form.status ?? null,
      machine_source: form.machine_source || null,
      machine_exam_date: form.machine_exam_date || null,
      machine_memo: form.machine_memo || null,
      meta: buildMetaPayload(),
    }
  }

  payload.meta = attachCoachingTip(payload.meta)
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateQuestion(id.value, payload)
      ElMessage.success(t('common.saveSuccess'))
    } else {
      await createQuestion(payload)
      ElMessage.success(t('common.createSuccess'))
    }
    router.push('/questions/list')
  } catch (e) {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    await loadForEdit()
  } else {
    await loadMeta(form.exam_type || undefined)
    metaJsonText.value = '{}'
    captureSnapshot()
  }
})
</script>

<style lang="scss" scoped>
.question-form-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tab-pane) {
    padding-top: 4px;
  }
}

.type-empty {
  margin: 24px 0 8px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0;
}

.form-id-tag {
  margin-left: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.tag-text.danger {
  color: #f56c6c;
  font-weight: 500;
}

.tag-text.warning {
  color: #e6a23c;
  font-weight: 500;
}

.meta-collapse {
  margin-bottom: 16px;
  border: none;

  :deep(.el-collapse-item__header) {
    font-weight: 500;
    color: #606266;
  }
}

.meta-section {
  padding-top: 4px;
}

.meta-json-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}

.meta-json-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.meta-json-textarea {
  flex: 1;

  :deep(.el-textarea__inner) {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
  }
}

.hint-text {
  font-size: 12px;
  color: #909399;
}

.error-tip {
  margin-top: 8px;
  color: #f56c6c;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
