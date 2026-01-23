import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import axios from 'axios';
import { AIService } from '../ai.js';

describe('AIService', () => {
  const ORIGINAL_ENV = process.env;
  let axiosPostSpy: any;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, HUGGINGFACE_API_KEY: 'test-hf-key' };
    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockPreferences = {
    favoriteCoins: ['BTC', 'ETH'],
    investorType: 'HODLer',
    contentPreferences: ['News'],
  };

  const mockMarketData = {
    prices: {
      bitcoin: { usd: 50000, usd_24h_change: 6 }, // > 5% for fallback logic
      ethereum: { usd: 3000, usd_24h_change: -2 },
    },
    newsCount: 5,
    topNewsTitle: 'Bitcoin hits new high',
  };

  describe('generateInsight', () => {
    it('should return fallback if API key is missing', async () => {
      delete process.env.HUGGINGFACE_API_KEY;
      const result = await AIService.generateInsight(mockPreferences, mockMarketData);
      // Fallback logic for change > 5
      expect(result).toContain('BITCOIN is up 6.00% today'); 
      expect(axiosPostSpy).not.toHaveBeenCalled();
    });

    it('should generate insight via API successfully', async () => {
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                content: ' AI Generated Insight ',
              },
            },
          ],
        },
      };
      axiosPostSpy.mockResolvedValue(mockResponse);

      const result = await AIService.generateInsight(mockPreferences, mockMarketData);

      expect(result).toBe('AI Generated Insight');
      expect(axiosPostSpy).toHaveBeenCalled();
    });

    it('should use fallback on API failure', async () => {
      axiosPostSpy.mockRejectedValue(new Error('HF Down'));
      
      const result = await AIService.generateInsight(mockPreferences, mockMarketData);
      
      expect(result).toContain('BITCOIN is up 6.00% today'); 
    });

    it('should use fallback on empty API response', async () => {
        const mockResponse = {
            data: {
              choices: [],
            },
          };
      axiosPostSpy.mockResolvedValue(mockResponse);

      const result = await AIService.generateInsight(mockPreferences, mockMarketData);
      expect(result).toContain('BITCOIN is up 6.00% today');
    });
  });
});
