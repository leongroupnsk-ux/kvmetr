import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        case: './case.html',
        blog: './blog.html',
        article: './article.html',
      },
    },
  },
});

