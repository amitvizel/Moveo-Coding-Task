export const COIN_OPTIONS = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'MATIC'] as const;

export const CONTENT_PREFERENCES = [
  { value: 'Market News' as const, label: 'Market News' },
  { value: 'Charts' as const, label: 'Charts' },
  { value: 'Social' as const, label: 'Social' },
  { value: 'Fun' as const, label: 'Fun' },
] as const;

export type ContentPreference = typeof CONTENT_PREFERENCES[number]['value'];

export const INVESTOR_TYPES = ['HODLer', 'Day Trader', 'NFT Collector'] as const;

export type InvestorType = typeof INVESTOR_TYPES[number];

interface CoinDisplayInfo {
  name: string;
  symbol: string;
}

export const COIN_DISPLAY_NAMES: Record<string, CoinDisplayInfo> = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC' },
  ethereum: { name: 'Ethereum', symbol: 'ETH' },
  solana: { name: 'Solana', symbol: 'SOL' },
  cardano: { name: 'Cardano', symbol: 'ADA' },
  dogecoin: { name: 'Dogecoin', symbol: 'DOGE' },
  ripple: { name: 'XRP', symbol: 'XRP' },
  polkadot: { name: 'Polkadot', symbol: 'DOT' },
  'matic-network': { name: 'Polygon', symbol: 'MATIC' },
};
