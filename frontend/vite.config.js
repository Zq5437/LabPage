import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    // GitHub Pages 部署配置
    // 环境变量 VITE_BASE_PATH 用于设置基础路径
    // 用户网站: VITE_BASE_PATH='/' (默认)
    // 项目网站: VITE_BASE_PATH='/仓库名/'
    base: process.env.VITE_BASE_PATH || '/',

    plugins: [vue()],
    optimizeDeps: {
        include: [
            'vue',
            'vue-router',
            'pinia',
            'axios',
            'dayjs',
            'element-plus',
            '@element-plus/icons-vue',
            'marked',
            'aos',
            'swiper'
        ]
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                silenceDeprecations: ['legacy-js-api']
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5080',
                changeOrigin: true
            },
            '/uploads': {
                target: 'http://localhost:5080',
                changeOrigin: true
            }
        }
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: '[ext]/[name]-[hash].[ext]'
            }
        }
    }
})
