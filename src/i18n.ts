import { createI18n } from 'vue-i18n'
import { zhMessages } from './locales/zh'
import { enMessages } from './locales/en'
import type { useAppStore } from './stores/app'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhMessages,
    en: enMessages,
  },
})

export function syncI18nLocale(language: 'zh-CN' | 'en') {
  i18n.global.locale.value = language
}

export function applyStoreLanguage(store: ReturnType<typeof useAppStore>) {
  syncI18nLocale(store.language)
}
