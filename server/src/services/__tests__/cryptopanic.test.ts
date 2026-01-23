import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import axios from 'axios';
import { CryptoPanicService } from '../cryptopanic.js';

describe('CryptoPanicService', () => {
  const ORIGINAL_ENV = process.env;
  let axiosGetSpy: any;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, CRYPTOPANIC_API_KEY: 'test-key' };
    axiosGetSpy = jest.spyOn(axios, 'get');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getNews', () => {
    it('should return empty list if API key is missing', async () => {
      delete process.env.CRYPTOPANIC_API_KEY;
      const result = await CryptoPanicService.getNews(['BTC']);
      expect(result).toEqual([]);
      expect(axiosGetSpy).not.toHaveBeenCalled();
    });

    it('should fetch and transform news successfully', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              id: 1,
              title: 'Test News',
              url: 'http://test.com',
              domain: 'test.com',
              created_at: '2023-01-01T00:00:00Z',
              source: { title: 'Test Source' },
            },
          ],
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const result = await CryptoPanicService.getNews(['BTC']);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Test News',
        url: 'http://test.com',
        domain: 'test.com',
        created_at: '2023-01-01T00:00:00Z',
      });
    });

    it('should handle API errors gracefully by returning empty list', async () => {
      axiosGetSpy.mockRejectedValue(new Error('Network Error'));
      const result = await CryptoPanicService.getNews(['BTC']);
      expect(result).toEqual([]);
    });

    it('should handle malformed response gracefully', async () => {
        // e.g. results is undefined
        axiosGetSpy.mockResolvedValue({ data: {} });
        
        const result = await CryptoPanicService.getNews();
        expect(result).toEqual([]);
    });
  });
});
