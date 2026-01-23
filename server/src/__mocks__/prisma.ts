import { jest } from '@jest/globals';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

export default mockPrisma;
