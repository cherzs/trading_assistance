import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            // All API and auth requests go to the backend
            '^/(api|auth|gemini-chat|bitcoin-data|ws-status|health|symbols|reset-chat)': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => {
                    // Remove /api prefix for backend
                    if (path.startsWith('/api/')) {
                        return path.replace(/^\/api/, '');
                    }
                    return path;
                }
            }
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                app: resolve(__dirname, 'src/app/index.html')
            }
        }
    },
    publicDir: 'public',
    base: './'
}); 