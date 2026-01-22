import axios from 'axios';

const CRYPTOPANIC_API_URL = 'https://cryptopanic.com/api/developer/v2/posts/';

export interface NewsItem {
  id: number;
  title: string;
  url: string;
  domain: string;
  created_at: string;
}

export class CryptoPanicService {
  /**
   * Fetch latest crypto news.
   * @param currencies Optional list of currency codes to filter by (e.g., ['BTC', 'ETH'])
   * @returns Array of news items.
   */
  static async getNews(currencies: string[] = []): Promise<NewsItem[]> {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;

    if (!apiKey) {
      console.warn('CRYPTOPANIC_API_KEY is not set. Returning empty news list.');
      return [];
    }

    try {
      const params: any = {
        auth_token: apiKey,
        public: 'true',
        kind: 'news',
      };

      if (currencies.length > 0) {
        // CryptoPanic accepts comma-separated currencies
        params.currencies = currencies.join(',');
      }

      const response = await axios.get(CRYPTOPANIC_API_URL, { params });
      
      // Log first item to debug structure (remove after fixing)
      if (response.data.results && response.data.results.length > 0) {
        console.log('[CryptoPanic] Sample API response:', JSON.stringify(response.data.results[0], null, 2));
      }
      
      // Transform the response to a simpler format
      return response.data.results.map((item: any) => {
        // CryptoPanic API might use different field names - try multiple possibilities
        const url = item.url || item.source?.url || item.link || item.source?.link || null;
        const domain = item.domain || item.source?.domain || item.source?.name || 'Unknown';
        
        return {
          id: item.id,
          title: item.title,
          url: url || `https://cryptopanic.com/news/${item.id}/`, // Fallback to CryptoPanic news page
          domain: domain,
          created_at: item.created_at,
        };
      });
    } catch (error) {
      // Log full error response for debugging
      if (axios.isAxiosError(error)) {
        console.error('Error fetching CryptoPanic news:', error.message, error.response?.data);
      } else {
        console.error('Error fetching CryptoPanic news:', error);
      }
      return [];
    }
  }
}
