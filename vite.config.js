import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: '*.mp4',      dest: '.' },
        { src: 'Logo*.svg',  dest: '.' },
        { src: 'Logo*.png',  dest: '.' },
        { src: 'OG-Graph.jpg', dest: '.' },
        { src: 'about-hero-cy-and-grin.jpg', dest: '.' },
        { src: 'GRINLOUD Music Radar Cover*.jpg', dest: '.' },
        { src: 'Music Radar Cover*.jpg', dest: '.' },
        { src: 'GRINLOUD Dance Beach Ibiza/*.mp4', dest: 'ibiza' },
        { src: 'GRINLOUD Dance Drive Thru/*.mp4', dest: 'drive-thru' },
        { src: 'GRINLOUD Partyboat/*.mp4', dest: 'partyboat' },
        { src: 'GRINLOUD Dance Stadion/*.mp4', dest: 'stadion' },
        { src: 'GRINLOUD DANCING - BEACH WITH PARROT/*.mp4', dest: 'beach' },
        { src: 'robots.txt', dest: '.' },
        { src: 'sitemap.xml', dest: '.' },
        { src: 'llms.txt', dest: '.' },
        { src: '404.html',   dest: '.' },
        { src: 'impressum.html', dest: '.' },
        { src: 'privacy.html',   dest: '.' },
        { src: 'about.html',     dest: '.' },
      ],
    }),
  ],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
