<template>
  <div class="navbar">
    <div class="nav-left">
      <div class="collapse-btn" :title="collapsed ? '展开菜单' : '收起菜单'" @click="$emit('toggle')">
        <el-icon :size="22">
          <DArrowLeft v-if="!collapsed" />
          <DArrowRight v-else />
        </el-icon>
      </div>
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item
          v-for="(item, idx) in breadcrumbs"
          :key="idx"
          :to="item.to"
        >
          <el-icon v-if="item.icon" class="crumb-icon">
            <component :is="item.icon" />
          </el-icon>
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="nav-right">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userStore.avatar">
            {{ userStore.nickname?.charAt(0) || 'A' }}
          </el-avatar>
          <span class="user-name">{{ userStore.nickname || userStore.userInfo?.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人中心
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, useRouter, type RouteRecordNormalized } from 'vue-router'
import { useUserStore } from '@/stores'
import { ElMessageBox } from 'element-plus'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

type BreadcrumbItem = {
  title: string
  icon?: Component
  to?: string
}

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

function resolveMenuIcon(iconName?: string): Component | undefined {
  if (!iconName) {
    return undefined
  } else {
    return (ElementPlusIconsVue as Record<string, Component>)[iconName]
  }
}

function buildCrumb(record: RouteRecordNormalized, clickable: boolean): BreadcrumbItem {
  const path = record.path.startsWith('/') ? record.path : `/${record.path}`
  return {
    title: record.meta?.title as string,
    icon: resolveMenuIcon(record.meta?.icon as string | undefined),
    to: clickable ? path : undefined,
  }
}

function findActiveMenuRoute(activeMenu?: string): RouteRecordNormalized | undefined {
  if (!activeMenu) {
    return undefined
  } else {
    return router.getRoutes().find((item) => item.path === activeMenu)
  }
}

const breadcrumbs = computed(() => {
  const items: BreadcrumbItem[] = []
  const parent = findActiveMenuRoute(route.meta?.activeMenu as string | undefined)
  if (parent?.meta?.title) {
    items.push(buildCrumb(parent, true))
  } else {
    // 列表页没有父级面包屑
  }
  for (const record of route.matched) {
    if (!record.meta?.title) {
      continue
    } else if (parent && record.path === parent.path) {
      continue
    } else {
      items.push(buildCrumb(record, false))
    }
  }
  return items
})

async function handleCommand(cmd: string) {
  if (cmd === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      await userStore.logout()
      router.push('/login')
    } catch (e) {
      // cancelled
    }
  } else if (cmd === 'profile') {
    // 预留
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  color: #303133;
  transition: background 0.2s;

  &:hover {
    background-color: #f2f3f5;
  }
}

.breadcrumb {
  font-size: 14px;

  :deep(.el-breadcrumb__inner) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
}

.crumb-icon {
  font-size: 16px;
  color: #606266;
}

.nav-right {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 4px;
    transition: background 0.2s;

    &:hover {
      background-color: #f2f3f5;
    }
  }

  .user-name {
    font-size: 14px;
    color: #303133;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
