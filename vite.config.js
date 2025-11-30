import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    server: {
        host: '0.0.0.0', // Allow access from other devices on the network
        port: 7878,
        strictPort: false // Try next available port if 7878 is taken
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true
    }
});

