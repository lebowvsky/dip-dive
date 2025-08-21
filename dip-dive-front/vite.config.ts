import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import stylelint from 'vite-plugin-stylelint';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    stylelint({
      include: ['src/**/*.{css,scss,vue}'],
      fix: true,
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @use "@/styles/main.scss" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
