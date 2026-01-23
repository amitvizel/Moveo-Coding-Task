import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import axios from 'axios';
import { MemeService } from '../meme.js';

describe('MemeService', () => {
  let axiosGetSpy: any;

  beforeEach(() => {
    axiosGetSpy = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Reset the static cache if possible
    (MemeService as any).dailyMeme = null;
  });

  describe('getMeme', () => {
    it('should fetch a meme from Reddit successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  title: 'Funny Meme',
                  url: 'https://i.redd.it/meme.jpg',
                  author: 'user1',
                  permalink: '/r/crypto/meme',
                },
              },
            ],
          },
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const result = await MemeService.getMeme();

      expect(result).toEqual({
        title: 'Funny Meme',
        url: 'https://i.redd.it/meme.jpg',
        author: 'user1',
        permalink: 'https://www.reddit.com/r/crypto/meme',
      });
    });

    it('should use fallback if Reddit API fails', async () => {
      axiosGetSpy.mockRejectedValue(new Error('Reddit Down'));

      const result = await MemeService.getMeme();

      expect(result).toEqual({
        title: 'When you check your portfolio',
        url: 'https://i.imgflip.com/2/1bij.jpg',
        author: 'fallback',
        permalink: 'https://imgflip.com/memetemplates',
      });
    });

    it('should use fallback if no image posts found', async () => {
      const mockResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  title: 'Discussion',
                  url: 'https://reddit.com/text-post', // Not an image
                  author: 'user2',
                  permalink: '/r/crypto/discuss',
                },
              },
            ],
          },
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const result = await MemeService.getMeme();
      expect(result?.author).toBe('fallback');
    });

    it('should cache the meme for the day', async () => {
       const mockResponse = {
        data: {
          data: {
            children: [
              {
                data: {
                  title: 'Cached Meme',
                  url: 'https://i.redd.it/cached.jpg',
                  author: 'user3',
                  permalink: '/r/crypto/cached',
                },
              },
            ],
          },
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      // First call
      await MemeService.getMeme();
      expect(axiosGetSpy).toHaveBeenCalledTimes(1);

      // Second call - should not hit API
      const result2 = await MemeService.getMeme();
      expect(result2?.title).toBe('Cached Meme');
      expect(axiosGetSpy).toHaveBeenCalledTimes(1);
    });
  });
});
