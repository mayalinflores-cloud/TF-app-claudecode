import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// En desarrollo, sirve las funciones de /api igual que Vercel en producción.
// Las variables de .env se cargan solo en el proceso del servidor (process.env),
// nunca en el bundle del cliente: Vite solo expone las que empiezan con VITE_.
function apiDevServer() {
  return {
    name: 'tf-api-dev-server',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const key of ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL']) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }

      server.middlewares.use('/api/chat', async (req, res) => {
        let raw = ''
        for await (const chunk of req) raw += chunk
        req.body = raw ? safeParse(raw) : undefined

        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(data))
          return res
        }

        try {
          const { default: handler } = await server.ssrLoadModule('/api/chat.js')
          await handler(req, res)
        } catch (error) {
          server.config.logger.error(`[api/chat] ${error?.stack ?? error}`)
          if (!res.headersSent) res.status(500).json({ error: 'Error interno del servidor de desarrollo.' })
        }
      })
    },
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevServer()],
})
