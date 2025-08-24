import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig(async () => {
  // Use dynamic import to load ESM-only plugins safely when Vite bundles the config
  const { default: react } = await import('@vitejs/plugin-react')
  const { default: tailwind } = await import('@tailwindcss/vite')

  return {
    plugins: [react(), tailwind()],
  }
})
