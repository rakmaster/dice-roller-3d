import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DiceRoller3DPlugin',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['three', 'cannon-es', '@dice-roller/core'],
      output: {
        globals: {
          three: 'THREE',
          'cannon-es': 'CANNON',
          '@dice-roller/core': 'DiceRollerCore'
        }
      }
    }
  }
});
