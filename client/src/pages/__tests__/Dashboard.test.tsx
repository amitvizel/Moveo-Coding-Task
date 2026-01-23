import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import client from '../../api/client';
import { vi } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock API Client
vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock Auth Context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: vi.fn(),
  }),
}));

// Mock Components that might cause issues or noise
vi.mock('../../components/MemeOfTheDay', () => ({
  default: () => <div data-testid="meme-component">Meme Component</div>,
}));

// Mock FeedbackButtons (used by AIInsight and MarketNews)
vi.mock('../../components/FeedbackButtons', () => ({
  default: () => <div data-testid="feedback-buttons">FeedbackButtons</div>,
  FeedbackContentType: { AI_INSIGHT: 'ai_insight', NEWS: 'news' },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading state initially', () => {
    (client.get as any).mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithTheme(<Dashboard />);
    expect(screen.getByText(/Loading your personalized dashboard/i)).toBeInTheDocument();
  });

  it('renders dashboard content on success', async () => {
    const mockData = {
      data: {
        prices: { bitcoin: { usd: 50000, usd_24h_change: 5 } },
        news: [{ id: 1, title: 'Crypto News', url: 'http://test.com', domain: 'test.com', created_at: new Date().toISOString() }],
        meme: { title: 'Funny Meme', url: 'meme.jpg', author: 'user', permalink: 'link' },
        aiInsight: 'Buy Bitcoin',
      },
    };
    (client.get as any).mockResolvedValue(mockData);

    renderWithTheme(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Crypto News')).toBeInTheDocument();
    expect(screen.getByText('Buy Bitcoin')).toBeInTheDocument();
    expect(screen.getByTestId('meme-component')).toBeInTheDocument();
  });

  it('renders error state on API failure', async () => {
    const errorResponse = {
      response: {
        data: {
          error: 'Failed to fetch data',
        },
      },
    };
    (client.get as any).mockRejectedValue(errorResponse);

    renderWithTheme(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});
