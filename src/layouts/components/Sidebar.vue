<template>
  <div class="sidebar">
    <div class="logo-wrapper" :style="{ padding: collapsed ? '16px 8px' : '16px' }">
      <div class="logo-inner">
        <svg viewBox="0 0 40 40" width="32" height="32" class="logo-icon">
          <defs>
            <linearGradient id="logoGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="#409eff" />
              <stop offset="100%" stop-color="#2563eb" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="36" height="36" rx="8" fill="url(#logoGrad)" />
          <text x="20" y="28" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">P</text>
        </svg>
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text">PTE Admin</span>
        </transition>
      </div>
    </div>
    <el-scrollbar class="menu-scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="var(--sidebar-bg)"
        text-color="var(--sidebar-text)"
        active-text-color="var(--sidebar-text-active)"
        router
        unique-opened
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-menu-item :index="route.path">
            <el-icon v-if="route.menuIcon">
              <component :is="route.menuIcon" />
            </el-icon>
            <template #title>{{ route.meta?.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, type RouteRecordRaw } from 'vue-router'
import router from '@/router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

type MenuRoute = RouteRecordRaw & {
  menuIcon?: Component
}

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()

const menuRoutes = computed<MenuRoute[]>(() => {
  const layoutRoute = router.getRoutes().find((r) => r.path === '/')
  if (!layoutRoute?.children) {
    return []
  }

  return layoutRoute.children
    .filter((child) => !child.meta?.hidden)
    .map((child) => ({
      ...child,
      path: resolveMenuPath(child.path),
      menuIcon: resolveMenuIcon(child.meta?.icon as string | undefined),
    }))
})

const activeMenu = computed(() => {
  if (route.meta?.activeMenu) {
    return route.meta.activeMenu as string
  }
  return route.path
})

function resolveMenuPath(path: string): string {
  if (path.startsWith('/')) {
    return path
  }
  return `/${path}`
}

function resolveMenuIcon(iconName?: string): Component | undefined {
  if (!iconName) {
    return undefined
  }
  return (ElementPlusIconsVue as Record<string, Component>)[iconName]
}
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: padding 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.logo-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  white-space: nowrap;
}

.menu-scroll {
  flex: 1;
  min-height: 0;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #fff !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
