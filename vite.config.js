import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import path from 'node:path';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd());
    return {
        base: env.VITE_BASE_PATH || '/',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        server: {
            host: '0.0.0.0',
            port: Number(env.VITE_PORT || 5174),
            open: false,
            proxy: {
                '/admin': {
                    target: env.VITE_API_BASE || 'http://127.0.0.1:8877',
                    changeOrigin: true,
                },
                '/app': {
                    target: env.VITE_API_BASE || 'http://127.0.0.1:8877',
                    changeOrigin: true,
                },
                '/uploads': {
                    target: env.VITE_API_BASE || 'http://127.0.0.1:8877',
                    changeOrigin: true,
                },
            },
        },
        plugins: [
            vue(),
            AutoImport({
                imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
                resolvers: [ElementPlusResolver()],
                dts: 'src/types/auto-imports.d.ts',
            }),
            Components({
                resolvers: [ElementPlusResolver()],
                dts: 'src/types/components.d.ts',
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
        },
        build: {
            outDir: 'dist',
            sourcemap: false,
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        vue: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
                        elementPlus: ['element-plus', '@element-plus/icons-vue'],
                    },
                },
            },
        },
    };
});
