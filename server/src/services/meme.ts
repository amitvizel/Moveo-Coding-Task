import axios from 'axios';

export interface Meme {
  title: string;
  url: string;
  author: string;
  permalink: string;
}

export class MemeService {
  /**
   * Fetch a random crypto meme from Reddit.
   * Falls back to a static meme if the API fails.
   * @returns A meme object with title, url, author, and permalink.
   */
  static async getMeme(): Promise<Meme | null> {
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

      return {
        title: randomPost.title,
        url: randomPost.url,
        author: randomPost.author,
        permalink: `https://www.reddit.com${randomPost.permalink}`,
      };
    } catch (error) {
      console.error('Error fetching meme from Reddit:', error);
      return this.getFallbackMeme();
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
