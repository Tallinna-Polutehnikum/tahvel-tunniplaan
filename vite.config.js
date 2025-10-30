import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [vue()],
    base: command === 'build' ? '/tahvel-tunniplaan/' : '/'
  }
});
