import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import axios from 'axios';
import { CoinGeckoService } from '../coingecko.js';

describe('CoinGeckoService', () => {
  let axiosGetSpy: any;

  beforeEach(() => {
    axiosGetSpy = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPrices', () => {
    it('should return empty object if no symbols provided', async () => {
      const result = await CoinGeckoService.getPrices([]);
      expect(result).toEqual({});
      expect(axiosGetSpy).not.toHaveBeenCalled();
    });

    it('should fetch prices successfully', async () => {
      const mockResponse = {
        data: {
          bitcoin: { usd: 50000, usd_24h_change: 2.5 },
          ethereum: { usd: 3000, usd_24h_change: -1.2 },
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const symbols = ['BTC', 'ETH'];
      const result = await CoinGeckoService.getPrices(symbols);

      expect(result).toEqual(mockResponse.data);
      expect(axiosGetSpy).toHaveBeenCalledWith(
        expect.stringContaining('/simple/price'),
        expect.any(Object)
      );
    });

    it('should throw error on API failure', async () => {
      axiosGetSpy.mockRejectedValue(new Error('API Error'));

      await expect(CoinGeckoService.getPrices(['BTC'])).rejects.toThrow(
        'Failed to fetch crypto prices'
      );
    });

    it('should ignore unknown symbols', async () => {
       // Mock for valid symbols only
       const mockResponse = {
        data: {
          bitcoin: { usd: 50000, usd_24h_change: 2.5 },
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const symbols = ['BTC', 'UNKNOWN_COIN'];
      const result = await CoinGeckoService.getPrices(symbols);

      expect(result).toEqual(mockResponse.data);
      expect(axiosGetSpy).toHaveBeenCalledTimes(1);
    });
  });
});
