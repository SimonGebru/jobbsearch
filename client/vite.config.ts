import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Jobbsökarappen',
        short_name: 'Jobbsök',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb', // Samma som din Tailwind blå
        icons: [
          {
            src: 'favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon',
          },
        ],
      },
    }),
  ],
})
