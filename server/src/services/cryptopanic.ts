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
      
      // Transform the response to a simpler format
      return response.data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        url: item.url,
        domain: item.domain,
        created_at: item.created_at,
      }));
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
