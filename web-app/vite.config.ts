import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowedHosts = ('dev.itts.fun')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@components': path.resolve(__dirname, './src/app/components'),
        '@pages': path.resolve(__dirname, './src/app/pages'),
        '@providers': path.resolve(__dirname, './src/app/providers'),
        '@feature': path.resolve(__dirname, './src/feature'),
        '@store': path.resolve(__dirname, './src/store'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@utility': path.resolve(__dirname, './src/utility'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || env.APP_HOST || '10.10.10.1',
      port: Number(env.VITE_DEV_PORT || '4001'),
      allowedHosts,
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
