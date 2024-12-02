import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'src/pages/login/login.html'),
                admin: resolve(__dirname, 'src/pages/admin/admin.html'),
                agent: resolve(__dirname, 'src/pages/agent/agent.html')
            }
        }
    },
    server: {
        port: 5175,
        open: true
    }
});