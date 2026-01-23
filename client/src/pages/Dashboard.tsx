import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';
import CoinPrices from '../components/CoinPrices';
import MarketNews from '../components/MarketNews';
import AIInsight from '../components/AIInsight';
import MemeOfTheDay from '../components/MemeOfTheDay';
import EditPreferencesModal from '../components/EditPreferencesModal';
import ThemeSwitcherModal from '../components/ThemeSwitcherModal';

interface DashboardData {
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  news: Array<{
    id: number;
    title: string;
    url: string;
    domain: string;
    created_at: string;
  }>;
  meme: {
    title: string;
    url: string;
    author: string;
    permalink: string;
  } | null;
  aiInsight: string;
}

const CACHE_DURATION = 60000; // 60 seconds

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState(false);
  const [isThemeSwitcherOpen, setIsThemeSwitcherOpen] = useState(false);
  const isFetchingRef = useRef(false);

  const formatLastUpdated = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const handlePreferencesSuccess = () => {
    // Force a re-fetch by clearing data and resetting lastFetch
    setData(null);
    setLastFetch(0);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) {
        console.log('[Dashboard] Fetch already in progress, skipping');
        return;
      }

      const now = Date.now();
      
      // Check if we have cached data and it's still fresh
      if (data && lastFetch && (now - lastFetch) < CACHE_DURATION) {
        console.log('[Dashboard] Using cached data, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        isFetchingRef.current = true;
        console.log('[Dashboard] Fetching fresh data from API');
        setLoading(true);
        setError('');
        const response = await client.get('/dashboard/data');
        
        setData(response.data);
        setLastFetch(now);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchDashboardData();
  }, [lastFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-skin-base text-skin-text-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-skin-primary mx-auto"></div>
          <p className="mt-4 text-skin-text-secondary">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-skin-base">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Dynamic card classes
  const cardClasses = "bg-skin-card p-6 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border-[length:var(--border-width-card)] border-skin-border transition-all duration-300";
  const memeCardClasses = "h-full bg-skin-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border-[length:var(--border-width-card)] border-skin-border transition-all duration-300 overflow-hidden";

  return (
    <div className="min-h-screen bg-skin-base text-skin-text-primary transition-colors duration-300">
      {/* Header */}
      <header className="bg-skin-card shadow-[var(--shadow-card)] border-b-[length:var(--border-width-card)] border-skin-border transition-all duration-300 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-skin-text-primary">
            Crypto Advisor Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsThemeSwitcherOpen(true)}
              className="px-4 py-2 text-sm bg-skin-primary-light text-skin-primary-text rounded hover:opacity-80 transition-all border border-skin-border"
            >
              Theme
            </button>
            <button
              onClick={() => setIsEditPreferencesOpen(true)}
              className="px-4 py-2 text-sm bg-skin-primary-light text-skin-primary-text rounded hover:opacity-80 transition-all border border-skin-border"
            >
              Edit Preferences
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-xl text-skin-text-secondary">
            Welcome back, {user?.name || user?.email}!
          </h2>
          <p className="text-skin-text-muted mt-1">
            Here's your personalized crypto market overview
          </p>
          {lastFetch > 0 && (
            <p className="text-xs text-skin-text-muted mt-2">
              Last updated: {formatLastUpdated(lastFetch)}
            </p>
          )}
        </div>

        {/* Layout Conditional Logic */}
        {theme === 'meme' ? (
          <div className="flex flex-col gap-6">
            {/* Hero Meme Card */}
            <div className={`${memeCardClasses} min-h-[400px]`}>
              <MemeOfTheDay meme={data?.meme || null} />
            </div>

            {/* Other Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coin Prices */}
              <div className={cardClasses}>
                <h3 className="text-lg font-semibold mb-4 flex items-center text-skin-text-primary">
                  <span className="mr-2">💰</span>
                  Your Coins
                </h3>
                <CoinPrices prices={data?.prices || {}} />
              </div>

              {/* Market News */}
              <div className={cardClasses}>
                <h3 className="text-lg font-semibold mb-4 flex items-center text-skin-text-primary">
                  <span className="mr-2">📰</span>
                  Market News
                </h3>
                <MarketNews news={data?.news || []} />
              </div>

              {/* AI Insight */}
              <div className={`${cardClasses} p-0 overflow-hidden`}>
                <AIInsight insight={data?.aiInsight || null} />
              </div>
            </div>
          </div>
        ) : (
          /* Standard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coin Prices Component */}
            <div className={cardClasses}>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-skin-text-primary">
                <span className="mr-2">💰</span>
                Your Coins
              </h3>
              <CoinPrices prices={data?.prices || {}} />
            </div>

            {/* Market News Component */}
            <div className={cardClasses}>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-skin-text-primary">
                <span className="mr-2">📰</span>
                Market News
              </h3>
              <MarketNews news={data?.news || []} />
            </div>

            {/* AI Insight Component */}
            <div className={`${cardClasses} p-0 overflow-hidden`}>
              <AIInsight insight={data?.aiInsight || null} />
            </div>

            <div className={memeCardClasses}>
              <MemeOfTheDay meme={data?.meme || null} />
            </div>
          </div>
        )}
      </main>

      {/* Edit Preferences Modal */}
      <EditPreferencesModal 
        isOpen={isEditPreferencesOpen}
        onClose={() => setIsEditPreferencesOpen(false)}
        onSuccess={handlePreferencesSuccess}
      />
      
      {/* Theme Switcher Modal */}
      <ThemeSwitcherModal
        isOpen={isThemeSwitcherOpen}
        onClose={() => setIsThemeSwitcherOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
