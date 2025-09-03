import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import path from 'path'
export default defineConfig({
    server: {
        host: 'erp.eit-host.com',  // Add this to force IPv4 only
       // https: {
        //    key: fs.readFileSync('C:/certs/elfisalt.key'),
         //   cert: fs.readFileSync('C:/certs/elfisalt.crt'),
        //},
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': path.resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': path.resolve(__dirname, 'resources/js'),
        },
         extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
});
