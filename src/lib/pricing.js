// Precios en USD por millón de tokens (API de Anthropic, verificados en octubre de 2026).
// Revisa https://platform.claude.com/docs/en/about-claude/pricing si cambias de modelo.
export const MODEL_PRICING = {
  'claude-sonnet-5-5': { input: 2, output: 10 },
  'claude-opus-5-5': { input: 4, output: 20 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
}

const DEFAULT_PRICING = MODEL_PRICING['claude-sonnet-5-5']

export const estimateCost = (model, usage) => {
  const price = MODEL_PRICING[model] ?? DEFAULT_PRICING
  const input = usage?.input_tokens ?? 0
  const output = usage?.output_tokens ?? 0
  return (input * price.input + output * price.output) / 1_000_000
}

export const formatUsd = (value) => `$${value.toFixed(4)}`
