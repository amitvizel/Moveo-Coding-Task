import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import axios from 'axios';
import { CoinGeckoService } from '../coingecko.js';

describe('CoinGeckoService', () => {
  const ORIGINAL_ENV = process.env;
  let axiosGetSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    axiosGetSpy = jest.spyOn(axios, 'get');
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
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

    it('should fetch prices successfully with API key', async () => {
      process.env.COINGECKO_API_KEY = 'test-api-key';
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
        expect.objectContaining({
          params: expect.any(Object),
          headers: expect.objectContaining({
            'x-cg-demo-api-key': 'test-api-key',
          }),
        })
      );
    });

    it('should fetch prices successfully without API key (with warning)', async () => {
      delete process.env.COINGECKO_API_KEY;
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
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'COINGECKO_API_KEY is not set. Using public API with limited rate limits.'
      );
      expect(axiosGetSpy).toHaveBeenCalledWith(
        expect.stringContaining('/simple/price'),
        expect.objectContaining({
          params: expect.any(Object),
          headers: {},
        })
      );
    });

    it('should throw error on API failure', async () => {
      process.env.COINGECKO_API_KEY = 'test-api-key';
      axiosGetSpy.mockRejectedValue(new Error('API Error'));

      await expect(CoinGeckoService.getPrices(['BTC'])).rejects.toThrow(
        'Failed to fetch crypto prices'
      );
    });

    it('should ignore unknown symbols', async () => {
      process.env.COINGECKO_API_KEY = 'test-api-key';
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

    it('should return empty objects for coins without data', async () => {
      process.env.COINGECKO_API_KEY = 'test-api-key';
      const mockResponse = {
        data: {
          bitcoin: { usd: 50000, usd_24h_change: 2.5 },
          'matic-network': {},
        },
      };
      axiosGetSpy.mockResolvedValue(mockResponse);

      const symbols = ['BTC', 'MATIC'];
      const result = await CoinGeckoService.getPrices(symbols);

      expect(result).toEqual(mockResponse.data);
      expect(result['matic-network']).toEqual({});
    });
  });
});
