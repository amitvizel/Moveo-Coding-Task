import React from 'react';
import { render, screen } from '@testing-library/react';
import AIInsight from '../AIInsight';

// Mock FeedbackButtons
vi.mock('../FeedbackButtons', () => ({
  default: () => <div data-testid="feedback-buttons">FeedbackButtons</div>,
  FeedbackContentType: { AI_INSIGHT: 'ai_insight' },
}));

describe('AIInsight', () => {
  it('renders loading state when insight is null', () => {
    render(<AIInsight insight={null} />);
    expect(screen.getByText(/Generating your personalized insight/i)).toBeInTheDocument();
  });

  it('renders insight when provided', () => {
    const insightText = 'Bitcoin is looking bullish today.';
    render(<AIInsight insight={insightText} />);
    
    expect(screen.getByText(insightText)).toBeInTheDocument();
    expect(screen.getByText(/AI-Powered Insight/i)).toBeInTheDocument();
    expect(screen.getByTestId('feedback-buttons')).toBeInTheDocument();
  });
});
