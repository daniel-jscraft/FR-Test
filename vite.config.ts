import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom', 
        globals: true, 
        env: {
            NODE_ENV: 'test',
        },
    },
});
