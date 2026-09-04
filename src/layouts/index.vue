<template>
  <el-container class="app-layout">
    <el-aside :width="sidebarWidth" class="app-sidebar">
      <Sidebar :collapsed="appStore.sidebarCollapsed" />
    </el-aside>
    <el-container class="app-main-container">
      <el-header class="app-header">
        <Navbar :collapsed="appStore.sidebarCollapsed" @toggle="appStore.toggleSidebar" />
      </el-header>
      <el-main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '220px'
})
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100%;
}

.app-sidebar {
  background-color: var(--sidebar-bg);
  transition: width 0.28s;
  overflow: hidden;
  border-right: 1px solid #000c17;
}

.app-main-container {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-header {
  background-color: var(--header-bg);
  border-bottom: 1px solid #e4e7ed;
  padding: 0 16px;
  height: var(--header-height);
  display: flex;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
}

.app-content {
  background-color: var(--bg-color);
  padding: 0;
  overflow: auto;
  flex: 1;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
