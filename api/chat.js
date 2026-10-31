import Anthropic from '@anthropic-ai/sdk'

// Modelo configurable desde el servidor; por defecto el Sonnet vigente
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'
const MAX_TOKENS = 2048
const MAX_MESSAGES = 20
const MAX_MESSAGE_CHARS = 4000
const MAX_SUMMARY_CHARS = 8000

const buildSystemPrompt = (summary) =>
  `Eres Boti, asistente financiero amigable de TF Finance. Tienes acceso al resumen financiero del usuario: ${summary}. Responde en español, de forma concisa y útil.`

// Normaliza el historial: solo roles válidos, texto no vacío y empezando por un mensaje del usuario
const sanitizeMessages = (raw) => {
  if (!Array.isArray(raw)) return []
  const clean = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content)
    .slice(-MAX_MESSAGES)
  const firstUser = clean.findIndex((m) => m.role === 'user')
  return firstUser === -1 ? [] : clean.slice(firstUser)
}

const formatSummary = (summary) => {
  if (!summary) return 'no disponible'
  const text = typeof summary === 'string' ? summary : JSON.stringify(summary, null, 2)
  return text.slice(0, MAX_SUMMARY_CHARS)
}

const errorResponse = (error) => {
  if (error instanceof Anthropic.AuthenticationError) {
    return [500, 'La API key de Anthropic configurada en el servidor no es válida.']
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return [500, 'La API key de Anthropic no tiene permiso para usar este modelo.']
  }
  if (error instanceof Anthropic.RateLimitError) {
    return [429, 'Boti está recibiendo demasiadas consultas. Intenta de nuevo en unos segundos.']
  }
  if (error instanceof Anthropic.BadRequestError) {
    return [400, `La API de Anthropic rechazó la solicitud: ${error.message}`]
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return [504, 'La API de Anthropic tardó demasiado en responder. Intenta de nuevo.']
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return [502, 'No se pudo conectar con la API de Anthropic. Revisa la conexión del servidor.']
  }
  if (error instanceof Anthropic.APIError) {
    const status = error.status && error.status >= 500 ? 502 : error.status || 502
    return [status, `La API de Anthropic devolvió un error (${error.status ?? 'sin código'}). Intenta de nuevo más tarde.`]
  }
  return [500, 'Ocurrió un error inesperado al procesar tu mensaje.']
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' })
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  const messages = sanitizeMessages(body?.messages)
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Falta el mensaje del usuario en "messages".' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'Falta configurar ANTHROPIC_API_KEY en el servidor. Agrégala como variable de entorno y vuelve a desplegar.',
    })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 60_000 })
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Respuestas de chat: esfuerzo bajo para respuestas rápidas y baratas
      output_config: { effort: 'low' },
      // Si el modelo declina por política, la API reintenta con un modelo alternativo
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: buildSystemPrompt(formatSummary(body.summary)),
      messages,
    })

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    const reply =
      response.stop_reason === 'refusal'
        ? 'Lo siento, no puedo ayudarte con esa solicitud. ¿Te ayudo con otra pregunta sobre tus finanzas?'
        : text || 'No pude generar una respuesta. ¿Puedes reformular tu pregunta?'

    return res.status(200).json({
      reply,
      model: response.model,
      stop_reason: response.stop_reason,
      truncated: response.stop_reason === 'max_tokens',
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    })
  } catch (error) {
    const [status, message] = errorResponse(error)
    console.error('[api/chat]', error?.status ?? '', error?.message ?? error)
    return res.status(status).json({ error: message })
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
