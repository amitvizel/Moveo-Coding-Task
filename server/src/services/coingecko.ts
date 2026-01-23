import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  XRP: 'ripple',
  DOT: 'polkadot',
  MATIC: 'matic-network',
};

export class CoinGeckoService {
  /**
   * Fetch current prices for a list of coin symbols.
   * @param symbols Array of coin symbols (e.g., ['BTC', 'ETH'])
   * @returns Object with coin IDs as keys and prices in USD.
   */
  static async getPrices(symbols: string[]): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
    try {
      // Convert symbols to IDs
      const ids = symbols
        .map((s) => SYMBOL_TO_ID[s.toUpperCase()])
        .filter((id) => id !== undefined);

      if (ids.length === 0) {
        return {};
      }

      const apiKey = process.env.COINGECKO_API_KEY;
      const headers: Record<string, string> = {};

      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
      } else {
        console.warn('COINGECKO_API_KEY is not set. Using public API with limited rate limits.');
      }

      const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
        params: {
          ids: ids.join(','),
          vs_currencies: 'usd',
          include_24hr_change: 'true',
        },
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching CoinGecko prices:', error);
      throw new Error('Failed to fetch crypto prices');
    }
  }
}
