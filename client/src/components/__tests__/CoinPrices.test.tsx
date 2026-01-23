import React from 'react';
import { render, screen } from '@testing-library/react';
import CoinPrices from '../CoinPrices';

describe('CoinPrices', () => {
  it('renders empty state when prices are empty', () => {
    render(<CoinPrices prices={{}} />);
    expect(screen.getByText(/No coin data available/i)).toBeInTheDocument();
  });

  it('renders prices correctly', () => {
    const prices = {
      bitcoin: { usd: 50000, usd_24h_change: 5 },
      ethereum: { usd: 3000, usd_24h_change: -2.5 },
    };

    render(<CoinPrices prices={prices} />);

    // Check for Bitcoin
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getAllByText('BTC').length).toBeGreaterThan(0);
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    // Regex because of arrow prefix
    expect(screen.getByText(/5\.00%/)).toBeInTheDocument();

    // Check for Ethereum
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    expect(screen.getByText(/-2\.50%/)).toBeInTheDocument();
  });
});
