import axios from 'axios';
import { AI_MAX_TOKENS, AI_TEMPERATURE, AI_TOP_P, AI_REQUEST_TIMEOUT_MS, AI_RESPONSE_MAX_LENGTH } from '../utils/constants.js';

// Using Hugging Face Router API (OpenAI-compatible format)
const HUGGINGFACE_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HUGGINGFACE_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';

export interface UserPreferences {
  favoriteCoins: string[];
  investorType: string;
  contentPreferences: string[];
}

export interface MarketData {
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  newsCount: number;
  topNewsTitle: string | undefined;
}

export class AIService {
  /**
   * Generate a personalized AI insight based on user preferences and market data.
   * @param userPreferences User's saved preferences
   * @param marketData Current market data (prices, news)
   * @returns A personalized insight string
   */
  static async generateInsight(
    userPreferences: UserPreferences,
    marketData: MarketData
  ): Promise<string> {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      console.log('[AIService] HUGGINGFACE_API_KEY is not set. Using fallback insight.');
      return this.getFallbackInsight(userPreferences, marketData);
    }

    console.log('[AIService] API key found, calling Hugging Face API...');

    try {
      const prompt = this.buildPrompt(userPreferences, marketData);
      console.log('[AIService] Prompt:', prompt.substring(0, 200) + '...');

      const startTime = Date.now();
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        {
          model: HUGGINGFACE_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: AI_MAX_TOKENS,
          temperature: AI_TEMPERATURE,
          top_p: AI_TOP_P,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: AI_REQUEST_TIMEOUT_MS,
        }
      );
      const duration = Date.now() - startTime;

      console.log(`[AIService] API call successful (${duration}ms)`);
      console.log('[AIService] Response:', JSON.stringify(response.data).substring(0, 300));

      // Extract the generated text from OpenAI-compatible format
      const generatedText = response.data.choices?.[0]?.message?.content || '';
      
      if (!generatedText) {
        console.warn('[AIService] No generated text in response, using fallback');
        return this.getFallbackInsight(userPreferences, marketData);
      }

      // Clean up the response
      const cleanedText = this.cleanResponse(generatedText);
      console.log('[AIService] Generated insight:', cleanedText);
      return cleanedText;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[AIService] Hugging Face API Error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      } else {
        console.error('[AIService] Error generating AI insight:', error);
      }
      console.log('[AIService] Falling back to local insight generation');
      return this.getFallbackInsight(userPreferences, marketData);
    }
  }

  /**
   * Build the prompt for the LLM based on user preferences and market data.
   */
  private static buildPrompt(
    userPreferences: UserPreferences,
    marketData: MarketData
  ): string {
    const { favoriteCoins, investorType, contentPreferences } = userPreferences;
    const { prices, newsCount, topNewsTitle } = marketData;

    // Build price summary
    let priceSummary = '';
    for (const [coinId, data] of Object.entries(prices)) {
      const change = data.usd_24h_change > 0 ? '+' : '';
      priceSummary += `${coinId}: $${data.usd.toFixed(2)} (${change}${data.usd_24h_change.toFixed(2)}%), `;
    }

    const prompt = `You are a crypto market advisor. Generate a brief, personalized daily insight (2-3 sentences) for a ${investorType} investor.

User's favorite coins: ${favoriteCoins.join(', ')}
Current prices: ${priceSummary}
Latest news: ${topNewsTitle || 'No major news today'}
User interests: ${contentPreferences.join(', ')}

Provide a concise insight about market trends or opportunities. Be professional but friendly.`;

    return prompt;
  }

  /**
   * Clean up the AI response by removing extra whitespace and truncating if needed.
   */
  private static cleanResponse(text: string): string {
    return text
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, AI_RESPONSE_MAX_LENGTH);
  }

  /**
   * Fallback insight when API is unavailable or fails.
   */
  private static getFallbackInsight(
    userPreferences: UserPreferences,
    marketData: MarketData
  ): string {
    const { favoriteCoins } = userPreferences;
    const { prices } = marketData;

    // Simple analysis based on price changes
    const changes = Object.entries(prices).map(([id, data]) => ({
      id,
      change: data.usd_24h_change,
    }));

    if (changes.length === 0) {
      return `Stay informed! Keep an eye on ${favoriteCoins.join(', ')} for potential opportunities.`;
    }

    const bestPerformer = changes.reduce((a, b) => (a.change > b.change ? a : b));
    const worstPerformer = changes.reduce((a, b) => (a.change < b.change ? a : b));

    if (bestPerformer.change > 5) {
      return `${bestPerformer.id.toUpperCase()} is up ${bestPerformer.change.toFixed(2)}% today! Consider reviewing your portfolio allocation.`;
    } else if (worstPerformer.change < -5) {
      return `${worstPerformer.id.toUpperCase()} is down ${Math.abs(worstPerformer.change).toFixed(2)}% today. This could be a buying opportunity if you believe in the fundamentals.`;
    } else {
      return `Markets are relatively stable today. Your tracked coins (${favoriteCoins.join(', ')}) are showing moderate movement.`;
    }
  }
}
