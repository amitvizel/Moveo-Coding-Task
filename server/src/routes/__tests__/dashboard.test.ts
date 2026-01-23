import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';
import prisma from '../../prisma.js';
import jwt from 'jsonwebtoken';
import { CacheService } from '../../services/cache.js';
import { CoinGeckoService } from '../../services/coingecko.js';
import { CryptoPanicService } from '../../services/cryptopanic.js';
import { MemeService } from '../../services/meme.js';
import { AIService } from '../../services/ai.js';

describe('Dashboard Routes', () => {
  let findUniqueSpy: any;
  let cacheGetSpy: any;
  let pricesSpy: any;
  let newsSpy: any;
  let memeSpy: any;
  let aiSpy: any;
  let verifySpy: any;

  beforeEach(() => {
    // Spies
    findUniqueSpy = jest.spyOn(prisma.user, 'findUnique');
    cacheGetSpy = jest.spyOn(CacheService, 'getCachedDataByType');
    // Note: setCachedDataByType is also called, we might spy on it to avoid real cache writes or errors?
    // It uses Redis or file? It uses a Map in memory (check code).
    // If it's in-memory, it's fine. If it's Redis, we should mock it.
    // Let's assume in-memory or spy it out.
    jest.spyOn(CacheService, 'setCachedDataByType').mockImplementation(async () => {});

    pricesSpy = jest.spyOn(CoinGeckoService, 'getPrices');
    newsSpy = jest.spyOn(CryptoPanicService, 'getNews');
    memeSpy = jest.spyOn(MemeService, 'getMeme');
    aiSpy = jest.spyOn(AIService, 'generateInsight');
    
    verifySpy = jest.spyOn(jwt, 'verify');

    // Mock JWT verify to success
    verifySpy.mockImplementation((token: string, secret: any, cb: any) => {
        if (token === 'valid-token') {
             cb(null, { userId: 'user-1' });
        } else {
             cb(new Error('Invalid token'), null);
        }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
      await prisma.$disconnect();
  });

  describe('GET /dashboard/data', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/dashboard/data');
      expect(res.status).toBe(401);
    });

    it('should return 403 if token invalid', async () => {
      const res = await request(app)
        .get('/dashboard/data')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(403);
    });

    it('should return dashboard data with empty preferences', async () => {
      findUniqueSpy.mockResolvedValue({
        id: 'user-1',
        preferences: {},
      });
      cacheGetSpy.mockResolvedValue(null);
      pricesSpy.mockResolvedValue({});
      newsSpy.mockResolvedValue([]);
      memeSpy.mockResolvedValue({ title: 'Meme' });
      aiSpy.mockResolvedValue('Insight');

      const res = await request(app)
        .get('/dashboard/data')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        prices: {},
        news: [],
        meme: { title: 'Meme' },
        aiInsight: 'Insight',
      });
    });

    it('should return 500 if a service fails (e.g. CoinGecko)', async () => {
      findUniqueSpy.mockResolvedValue({
        id: 'user-1',
        preferences: { favoriteCoins: ['BTC'] },
      });
      cacheGetSpy.mockResolvedValue(null);
      pricesSpy.mockRejectedValue(new Error('API Error'));

      const res = await request(app)
        .get('/dashboard/data')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch dashboard data. Please try again later.');
    });

     it('should return cached data if available', async () => {
      findUniqueSpy.mockResolvedValue({
        id: 'user-1',
        preferences: {},
      });

      cacheGetSpy.mockImplementation(async (userId: string, type: string) => {
          if (type === 'prices') return { bitcoin: { usd: 100 } };
          if (type === 'news') return [{ title: 'News' }];
          if (type === 'meme') return { title: 'Cached Meme' };
          if (type === 'aiInsight') return 'Cached Insight';
          return null;
      });

      const res = await request(app)
        .get('/dashboard/data')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body.prices).toEqual({ bitcoin: { usd: 100 } });
      expect(pricesSpy).not.toHaveBeenCalled();
    });
  });
});
