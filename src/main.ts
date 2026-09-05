import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAppStore } from './stores/app'
import { applyStoreLanguage, i18n } from './i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'

const app = createApp(App)

app.use(pinia)
applyStoreLanguage(useAppStore())
app.use(i18n)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
