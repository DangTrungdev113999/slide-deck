import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages this is served from https://<user>.github.io/slide-deck/,
// so production assets need the '/slide-deck/' base. Local dev stays at '/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/slide-deck/' : '/',
  plugins: [react()],
}))
