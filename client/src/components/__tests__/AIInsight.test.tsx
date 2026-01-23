import React from 'react';
import { render, screen } from '@testing-library/react';
import AIInsight from '../AIInsight';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock FeedbackButtons
vi.mock('../FeedbackButtons', () => ({
  default: () => <div data-testid="feedback-buttons">FeedbackButtons</div>,
  FeedbackContentType: { AI_INSIGHT: 'ai_insight' },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('AIInsight', () => {
  it('renders loading state when insight is null', () => {
    renderWithTheme(<AIInsight insight={null} />);
    expect(screen.getByText(/Generating your personalized insight/i)).toBeInTheDocument();
  });

  it('renders insight when provided', () => {
    const insightText = 'Bitcoin is looking bullish today.';
    renderWithTheme(<AIInsight insight={insightText} />);
    
    expect(screen.getByText(insightText)).toBeInTheDocument();
    expect(screen.getByText(/AI Insight of the Day/i)).toBeInTheDocument();
    expect(screen.getByTestId('feedback-buttons')).toBeInTheDocument();
  });
});
