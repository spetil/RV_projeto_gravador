import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  // 👇 ESTA É A LINHA QUE CORRIGE A TELA BRANCA EM PRODUÇÃO 👇
  base: './', 
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
