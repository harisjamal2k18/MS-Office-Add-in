/**
 * Cost Estimator for AI Models
 * Rates in USD per 1M tokens (prompt / completion)
 */
export interface ModelPricing {
  promptPer1M: number;
  completionPer1M: number;
}

export const PRICING_TABLE: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { promptPer1M: 2.50, completionPer1M: 10.00 },
  'gpt-4o-mini': { promptPer1M: 0.15, completionPer1M: 0.60 },
  'o1': { promptPer1M: 15.00, completionPer1M: 60.00 },
  'o3-mini': { promptPer1M: 1.10, completionPer1M: 4.40 },

  // Anthropic
  'claude-3-7-sonnet-20250219': { promptPer1M: 3.00, completionPer1M: 15.00 },
  'claude-3-5-sonnet-20241022': { promptPer1M: 3.00, completionPer1M: 15.00 },
  'claude-3-5-haiku-20241022': { promptPer1M: 0.80, completionPer1M: 4.00 },

  // Google Gemini
  'gemini-2.5-pro': { promptPer1M: 1.25, completionPer1M: 5.00 },
  'gemini-2.5-flash': { promptPer1M: 0.075, completionPer1M: 0.30 },
  'gemini-2.0-flash': { promptPer1M: 0.10, completionPer1M: 0.40 },

  // OpenRouter (popular defaults)
  'deepseek/deepseek-r1': { promptPer1M: 0.55, completionPer1M: 2.19 },
  'meta-llama/llama-3.3-70b-instruct': { promptPer1M: 0.40, completionPer1M: 0.40 }
};

export function estimateCost(model: string, promptTokens: number, completionTokens: number): number | null {
  const normalizedModel = Object.keys(PRICING_TABLE).find(k => model.toLowerCase().includes(k.toLowerCase()));
  if (!normalizedModel) return null;

  const pricing = PRICING_TABLE[normalizedModel];
  const promptCost = (promptTokens / 1_000_000) * pricing.promptPer1M;
  const completionCost = (completionTokens / 1_000_000) * pricing.completionPer1M;
  return Number((promptCost + completionCost).toFixed(5));
}
