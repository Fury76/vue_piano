import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    lib: {
      // 入口文件路径，根据您的项目结构进行调整
      entry: './src/index.js',
      name: 'VirtualPianoVue',
      // 自定义输出文件名
      fileName: (format) => format === 'es' ? 'index.esm.js' : 'index.js',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // 确保外部化处理那些您不想打包进库的依赖
      external: ['vue', 'tone'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          tone: 'Tone',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0', // 监听所有IP地址
    port: 3000,      // 设置端口号，可改成其他端口
  }
})
