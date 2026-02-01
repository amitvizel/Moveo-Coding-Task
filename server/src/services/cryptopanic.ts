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
      const params: Record<string, string> = {
        auth_token: apiKey,
        public: 'true',
        kind: 'news',
      };

      if (currencies.length > 0) {
        // CryptoPanic accepts comma-separated currencies
        params.currencies = currencies.join(',');
      }

      const response = await axios.get(CRYPTOPANIC_API_URL, { params });
      const raw = response.data?.results ?? response.data?.data ?? response.data;
      const resultsArray = Array.isArray(raw) ? raw : response.data?.results || [];

      // CryptoPanic API v2 returns: title, description, published_at, created_at, kind
      // (no id, url, or domain). Older/v1 format may include id, pk, url, source.
      interface CryptoPanicItem {
        id?: number;
        pk?: number;
        title: string;
        description?: string;
        url?: string;
        source?: {
          url?: string;
          link?: string;
          domain?: string;
          name?: string;
        };
        link?: string;
        domain?: string;
        created_at?: string;
        published_at?: string;
      }

      return resultsArray
        .filter((item: CryptoPanicItem) => item?.title != null)
        .map((item: CryptoPanicItem, index: number) => {
          const url = item.url || item.source?.url || item.link || item.source?.link || null;
          const domain = item.domain || item.source?.domain || item.source?.name || 'CryptoPanic';
          const dateStr = item.created_at || item.published_at || new Date().toISOString();
          const postId = item.id ?? item.pk ?? index;
          return {
            id: postId,
            title: item.title,
            url: url || `https://cryptopanic.com/`,
            domain: domain,
            created_at: dateStr,
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
