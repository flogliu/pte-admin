<template>
  <el-sub-menu :index="resolvePath(item.path)">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </template>
    <template v-for="child in item.children || []" :key="child.path">
      <SubMenuItem
        v-if="child.children && child.children.length > 0 && hasVisibleChildren(child)"
        :item="child"
      />
      <el-menu-item v-else-if="!child.meta?.hidden" :index="resolveChildPath(item.path, child.path)">
        <el-icon v-if="child.meta?.icon">
          <component :is="child.meta.icon" />
        </el-icon>
        <template #title>{{ child.meta?.title }}</template>
      </el-menu-item>
    </template>
  </el-sub-menu>
</template>

<script setup lang="ts">
import { type RouteRecordRaw } from 'vue-router'

defineProps<{
  item: RouteRecordRaw
}>()

function hasVisibleChildren(item: RouteRecordRaw): boolean {
  return (item.children || []).some((c) => !c.meta?.hidden)
}

function resolvePath(p: string): string {
  if (p.startsWith('/')) return p
  return '/' + p
}

function resolveChildPath(parentPath: string, childPath: string): string {
  if (childPath.startsWith('/')) return childPath
  const normalized = parentPath.endsWith('/') ? parentPath.slice(0, -1) : parentPath
  if (normalized.startsWith('/')) {
    return `${normalized}/${childPath}`
  }
  return `/${normalized}/${childPath}`
}
</script>
