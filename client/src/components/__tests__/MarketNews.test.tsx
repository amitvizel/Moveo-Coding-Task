import React from 'react';
import { render, screen } from '@testing-library/react';
import MarketNews from '../MarketNews';

// Mock FeedbackButtons
vi.mock('../FeedbackButtons', () => ({
  default: () => <div data-testid="feedback-buttons">FeedbackButtons</div>,
  FeedbackContentType: { NEWS: 'news' },
}));

describe('MarketNews', () => {
  it('renders empty state when news is empty', () => {
    render(<MarketNews news={[]} />);
    expect(screen.getByText(/No news available/i)).toBeInTheDocument();
  });

  it('renders news items correctly', () => {
    const news = [
      {
        id: 1,
        title: 'Crypto Market Rally',
        url: 'http://example.com',
        domain: 'example.com',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Another News',
        url: null,
        domain: 'test.com',
        created_at: new Date().toISOString(),
      },
    ];

    render(<MarketNews news={news} />);

    // First item
    expect(screen.getByText('Crypto Market Rally')).toBeInTheDocument();
    expect(screen.getByText(/example.com/)).toBeInTheDocument();
    
    // Second item
    expect(screen.getByText('Another News')).toBeInTheDocument();
    
    // Check feedback buttons
    expect(screen.getAllByTestId('feedback-buttons')).toHaveLength(2);
  });
});
