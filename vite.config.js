import { defineConfig } from 'vite';

// Конфигурация сборщика Vite для проекта Mesto
export default defineConfig({
  // Базовый путь задаем как относительный ('./'), 
  // это критически важно для корректной работы проекта на GitHub Pages
  base: './',
  
  server: {
    // Автоматически открывать браузер при запуске
    open: true,
    host: 'localhost',
    port: 5173,
  },
});