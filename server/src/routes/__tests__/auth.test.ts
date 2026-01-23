import { jest, describe, it, expect, beforeEach, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import prisma from '../../prisma.js';
import app from '../../app.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Routes', () => {
  let findUniqueSpy: any;
  let createSpy: any;
  let hashSpy: any;
  let compareSpy: any;
  let signSpy: any;

  beforeEach(() => {
    // Spy on Prisma
    findUniqueSpy = jest.spyOn(prisma.user, 'findUnique');
    createSpy = jest.spyOn(prisma.user, 'create');
    
    // Spy on Bcrypt
    hashSpy = jest.spyOn(bcrypt, 'hash');
    compareSpy = jest.spyOn(bcrypt, 'compare');

    // Spy on JWT
    signSpy = jest.spyOn(jwt, 'sign');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
      // Close prisma connection if it was opened
      await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('should create a new user and return token', async () => {
      findUniqueSpy.mockResolvedValue(null);
      createSpy.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      });
      hashSpy.mockResolvedValue('hashed-password');
      signSpy.mockImplementation(() => 'mock-token');

      const res = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(createSpy).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      findUniqueSpy.mockResolvedValue({ id: 'existing' });

      const res = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already in use');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      findUniqueSpy.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        preferences: {}
      });
      compareSpy.mockResolvedValue(true);
      signSpy.mockImplementation(() => 'mock-token');

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 404 if user not found', async () => {
      findUniqueSpy.mockResolvedValue(null);

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });

    it('should return 400 if password invalid', async () => {
       findUniqueSpy.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });
      compareSpy.mockResolvedValue(false);

      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});
