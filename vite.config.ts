import { defineConfig } from 'vite';
import { viteLazyInject } from './src/plugin';

export default defineConfig({
  plugins: [viteLazyInject()],
});
