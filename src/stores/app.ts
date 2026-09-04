import { defineStore } from 'pinia'

type LayoutMode = 'side' | 'top'

interface AppState {
  sidebarCollapsed: boolean
  layoutMode: LayoutMode
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    layoutMode: 'side',
    theme: 'light',
    language: 'zh-CN',
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setLayoutMode(mode: LayoutMode) {
      this.layoutMode = mode
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    setLanguage(lang: 'zh-CN' | 'en') {
      this.language = lang
    },
  },
  persist: {
    key: 'pte-admin-app',
    paths: ['sidebarCollapsed', 'layoutMode', 'theme', 'language'],
  },
})
