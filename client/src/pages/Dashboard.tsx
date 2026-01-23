import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import CoinPrices from '../components/CoinPrices';
import MarketNews from '../components/MarketNews';
import AIInsight from '../components/AIInsight';
import MemeOfTheDay from '../components/MemeOfTheDay';
import EditPreferencesModal from '../components/EditPreferencesModal';

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
const MEME_STORAGE_KEY = 'crypto_advisor_daily_meme';
const MEME_DATE_KEY = 'crypto_advisor_meme_date';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isEditPreferencesOpen, setIsEditPreferencesOpen] = useState(false);

  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]!;
  };

  const formatLastUpdated = (timestamp: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  const getCachedMeme = (): DashboardData['meme'] | null => {
    const cachedDate = localStorage.getItem(MEME_DATE_KEY);
    const today = getTodayDate();
    
    if (cachedDate === today) {
      const cachedMeme = localStorage.getItem(MEME_STORAGE_KEY);
      if (cachedMeme) {
        try {
          return JSON.parse(cachedMeme);
        } catch (e) {
          console.error('Failed to parse cached meme:', e);
        }
      }
    }
    return null;
  };

  const setCachedMeme = (meme: DashboardData['meme']) => {
    if (meme) {
      localStorage.setItem(MEME_STORAGE_KEY, JSON.stringify(meme));
      localStorage.setItem(MEME_DATE_KEY, getTodayDate());
    }
  };

  const handlePreferencesSuccess = () => {
    // Force a re-fetch by clearing data and resetting lastFetch
    setData(null);
    setLastFetch(0);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const now = Date.now();
      
      // Check if we have cached data and it's still fresh
      if (data && lastFetch && (now - lastFetch) < CACHE_DURATION) {
        console.log('[Dashboard] Using cached data, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('[Dashboard] Fetching fresh data from API');
        setLoading(true);
        setError('');
        const response = await client.get('/dashboard/data');
        
        // Always check for cached meme first (persists across refreshes)
        const cachedMeme = getCachedMeme();
        const memeToUse = cachedMeme || response.data.meme;
        
        // If we got a new meme from API and don't have cached one, cache it
        if (response.data.meme && !cachedMeme) {
          console.log('[Dashboard] Caching new meme for today');
          setCachedMeme(response.data.meme);
        } else if (cachedMeme) {
          console.log('[Dashboard] Using cached meme from localStorage');
        }
        
        // Merge API data with cached meme
        const dashboardData = {
          ...response.data,
          meme: memeToUse,
        };
        
        setData(dashboardData);
        setLastFetch(now);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard');
        
        // On error, try to load cached meme if available
        const cachedMeme = getCachedMeme();
        if (cachedMeme && data) {
          setData({ ...data, meme: cachedMeme });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [data, lastFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Crypto Advisor Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditPreferencesOpen(true)}
              className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
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
          <h2 className="text-xl text-gray-600">
            Welcome back, {user?.name || user?.email}!
          </h2>
          <p className="text-gray-500 mt-1">
            Here's your personalized crypto market overview
          </p>
          {lastFetch > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated: {formatLastUpdated(lastFetch)}
            </p>
          )}
        </div>

        {/* Dashboard Grid - Will hold 4 components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coin Prices Component */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Your Coins
            </h3>
            <CoinPrices prices={data?.prices || {}} />
          </div>

          {/* Market News Component */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📰</span>
              Market News
            </h3>
            <MarketNews news={data?.news || []} />
          </div>

          {/* AI Insight Component */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <AIInsight insight={data?.aiInsight || null} />
          </div>

          <div className="h-full">
            <MemeOfTheDay meme={data?.meme || null} />
          </div>
        </div>
      </main>

      {/* Edit Preferences Modal */}
      <EditPreferencesModal 
        isOpen={isEditPreferencesOpen}
        onClose={() => setIsEditPreferencesOpen(false)}
        onSuccess={handlePreferencesSuccess}
      />
    </div>
  );
};

export default Dashboard;
