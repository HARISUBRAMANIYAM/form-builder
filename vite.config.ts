import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Auto-generates index.d.ts entry point
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'HrmsFormBuilder',
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Externalize react & formik so consumer apps use their own copies
      external: [
        'react',
        'react-dom',
        'formik',
        'yup',
        'primereact',
        'bootstrap',
        'bootstrap-icons',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          formik: 'Formik',
          yup: 'Yup',
          primereact: 'PrimeReact',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name || 'assets/[name][extname]';
        },
      },
    },
  },
});