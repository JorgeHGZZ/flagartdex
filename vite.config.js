// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: '/index.html',
                mexico: '/src/Mexico.html',
                banderas: '/src/banderas.html',
                scanner: '/src/scanner.html',
                japon: '/src/japon.html',
                eua: '/src/eua.html',
                brasil: '/src/brasil.html',
                argentina: '/src/argentina.html',
                canada: '/src/canada.html',
                iran: '/src/iran.html',
                surcorea: '/src/surcorea.html',
                australia: '/src/australia.html',
                uzbekistan: '/src/uzbekistan.html',
                jordania: '/src/jordania.html',
                ecuador: '/src/ecuador.html',
                zelanda: '/src/zelanda.html',
            }
        },
        chunkSizeWarningLimit: 2000
    }
})
