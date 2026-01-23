import React from 'react';
import { COIN_DISPLAY_NAMES } from '../constants';

interface CoinPricesProps {
  prices: Record<string, { usd?: number; usd_24h_change?: number }>;
}

const CoinPrices: React.FC<CoinPricesProps> = ({ prices }) => {

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null || isNaN(price)) {
      return 'N/A';
    }
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatChange = (change: number | undefined) => {
    if (change === undefined || change === null || isNaN(change)) {
      return 'N/A';
    }
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number | undefined) => {
    if (change === undefined || change === null || isNaN(change)) {
      return 'text-skin-text-muted';
    }
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-skin-text-muted';
  };

  const getChangeBgColor = (change: number | undefined) => {
    if (change === undefined || change === null || isNaN(change)) {
      return 'bg-skin-base';
    }
    if (change > 0) return 'bg-green-50';
    if (change < 0) return 'bg-red-50';
    return 'bg-skin-base';
  };

  const coinEntries = Object.entries(prices).filter(
    (entry): entry is [string, { usd: number; usd_24h_change: number }] => {
      const [, data] = entry;
      return data !== null && 
             data !== undefined && 
             typeof data === 'object' &&
             typeof data.usd === 'number' && 
             typeof data.usd_24h_change === 'number';
    }
  );

  if (coinEntries.length === 0) {
    return (
      <div className="text-center py-8 text-skin-text-muted">
        <p>No coin data available</p>
        <p className="text-sm mt-2">Select your favorite coins in settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {coinEntries.map(([coinId, data]) => {
        const displayInfo = COIN_DISPLAY_NAMES[coinId] || { 
          name: coinId.charAt(0).toUpperCase() + coinId.slice(1), 
          symbol: coinId.toUpperCase().slice(0, 4) 
        };
        
        // TypeScript knows data is valid after filter, but we extract for clarity
        const usd = data.usd;
        const usd_24h_change = data.usd_24h_change;
        
        return (
          <div
            key={coinId}
            className="flex items-center justify-between p-4 bg-skin-base rounded-lg hover:opacity-90 transition-opacity border border-skin-border"
          >
            {/* Coin Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {displayInfo.symbol.slice(0, 3)}
              </div>
              <div>
                <p className="font-semibold text-skin-text-primary">{displayInfo.name}</p>
                <p className="text-sm text-skin-text-muted">{displayInfo.symbol}</p>
              </div>
            </div>

            {/* Price and Change */}
            <div className="text-right">
              <p className="font-semibold text-skin-text-primary">
                {formatPrice(usd)}
              </p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${getChangeBgColor(
                  usd_24h_change
                )} ${getChangeColor(usd_24h_change)}`}
              >
                {usd_24h_change > 0 ? '↑' : usd_24h_change < 0 ? '↓' : '→'}{' '}
                {formatChange(usd_24h_change)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoinPrices;
