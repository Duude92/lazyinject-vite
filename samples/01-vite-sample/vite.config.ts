import { defineConfig } from 'vite';
import { viteLazyInject } from '@duude92/lazyinject-vite';

export default defineConfig({
  plugins: [viteLazyInject()],
});
