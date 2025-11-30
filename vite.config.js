import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        port: 3000,
        open: true,
        cors: true
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // 将 node_modules 单独打包为 vendor 或 element-plus 等块
                    if (id.includes('node_modules')) {
                        if (id.includes('element-plus')) {
                            return 'element-plus'
                        }
                        if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
                            return 'vendor'
                        }
                        return 'vendor-others'
                    }
                    // 按 views 拆分路由页面
                    if (id.includes('/src/views/')) {
                        if (id.includes('Dashboard.vue')) return 'view-dashboard'
                        if (id.includes('Account.vue')) return 'view-account'
                        if (id.includes('Appointments.vue')) return 'view-appointments'
                        if (id.includes('Challenges.vue')) return 'view-challenges'
                        if (id.includes('MonthlySummary.vue')) return 'view-monthlySummary'
                        if (id.includes('Search.vue')) return 'view-search'
                        if (id.includes('FamilyGroup.vue')) return 'view-family'
                        if (id.includes('HealthRecords.vue')) return 'view-records'
                        if (id.includes('Login.vue') || id.includes('Register.vue')) return 'view-auth'
                    }
                    // 按 stores 拆包
                    if (id.includes('/src/stores/')) {
                        return 'stores'
                    }
                    // 按 api 拆包
                    if (id.includes('/src/api/')) {
                        return 'api'
                    }
                    // 其他保持默认
                },
            },
        },
        // 入口 chunk 很难再压缩得特别小，适当提高阈值避免无意义警告
        chunkSizeWarningLimit: 1200,
    },
})
