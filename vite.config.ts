import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for a React project
export default defineConfig({
  plugins: [
    // Enables React Fast Refresh and JSX support
    react(),
  ],
  optimizeDeps: {
    // Exclude 'lucide-react' from dependency pre-bundling.
    // This is useful if the package requires specific handling or is already optimized.
    exclude: ['lucide-react'],
  },
});
