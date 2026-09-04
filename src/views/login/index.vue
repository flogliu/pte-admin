<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-brand">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" width="48" height="48">
            <defs>
              <linearGradient id="brandGrad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stop-color="#409eff" />
                <stop offset="100%" stop-color="#2563eb" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#brandGrad)" />
            <text x="24" y="34" text-anchor="middle" fill="#fff" font-size="26" font-weight="bold">P</text>
          </svg>
        </div>
        <h1 class="brand-title">PTE Teacher Admin</h1>
        <p class="brand-sub">PTE 题库录入管理平台 · 教师端</p>
      </div>

      <el-card class="login-card" shadow="always">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入管理员账号"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <div class="login-footer">
        <span>© {{ year }} PTE Teacher Admin. All rights reserved.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import type { LoginForm } from '@/types'

const formRef = ref<FormInstance>()
const loading = ref(false)
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const year = computed(() => new Date().getFullYear())

const form = reactive<LoginForm>({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({ ...form })
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e) {
    // error handled by request interceptor
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // auto focus
})
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    opacity: 0.15;
    background: #fff;
  }

  &::before {
    width: 600px;
    height: 600px;
    top: -200px;
    left: -200px;
  }

  &::after {
    width: 400px;
    height: 400px;
    bottom: -150px;
    right: -150px;
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-brand {
  text-align: center;
  color: #fff;
  margin-bottom: 8px;
}

.brand-logo {
  margin: 0 auto 12px;
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.brand-sub {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.login-card {
  border-radius: 12px;
  border: none;

  :deep(.el-card__body) {
    padding: 32px 28px 20px;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 2px;
}

.login-footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}
</style>
