import axios from 'axios';

export interface Meme {
  title: string;
  url: string;
  author: string;
  permalink: string;
}

export class MemeService {
  private static dailyMeme: { meme: Meme; date: string } | null = null;

  /**
   * Get today's date in YYYY-MM-DD format.
   */
  private static getTodayDate(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]!;
  }

  /**
   * Fetch a random crypto meme from Reddit.
   * Returns the same meme for the entire day (cached by date).
   * Falls back to a static meme if the API fails.
   * @returns A meme object with title, url, author, and permalink.
   */
  static async getMeme(): Promise<Meme | null> {
    const today = this.getTodayDate();

    // Check if we have a cached meme from today
    if (this.dailyMeme && this.dailyMeme.date === today) {
      console.log('[MemeService] Returning cached meme for today:', today);
      return this.dailyMeme.meme;
    }

    console.log('[MemeService] Fetching new meme for today:', today);
    try {
      // Fetch from r/cryptocurrencymemes (popular crypto meme subreddit)
      const response = await axios.get('https://www.reddit.com/r/cryptocurrencymemes/hot.json', {
        params: { limit: 50 },
        headers: {
          'User-Agent': 'CryptoAdvisorApp/1.0',
        },
      });

      const posts = response.data.data.children;
      
      // Filter for posts with images (not videos or text posts)
      const imagePosts = posts.filter((post: any) => {
        const url = post.data.url;
        return (
          url &&
          (url.endsWith('.jpg') || 
           url.endsWith('.jpeg') || 
           url.endsWith('.png') || 
           url.endsWith('.gif') ||
           url.includes('i.redd.it'))
        );
      });

      if (imagePosts.length === 0) {
        return this.getFallbackMeme();
      }

      // Pick a random meme from the filtered list
      const randomIndex = Math.floor(Math.random() * imagePosts.length);
      const randomPost = imagePosts[randomIndex].data;

      const meme: Meme = {
        title: randomPost.title,
        url: randomPost.url,
        author: randomPost.author,
        permalink: `https://www.reddit.com${randomPost.permalink}`,
      };

      // Cache the meme for today
      this.dailyMeme = { meme, date: today };
      return meme;
    } catch (error) {
      console.error('Error fetching meme from Reddit:', error);
      const fallbackMeme = this.getFallbackMeme();
      // Cache the fallback meme too
      this.dailyMeme = { meme: fallbackMeme, date: today };
      return fallbackMeme;
    }
  }

  /**
   * Returns a static fallback meme if Reddit API fails.
   */
  private static getFallbackMeme(): Meme {
    return {
      title: 'When you check your portfolio',
      url: 'https://i.imgflip.com/2/1bij.jpg',
      author: 'fallback',
      permalink: 'https://imgflip.com/memetemplates',
    };
  }
}
