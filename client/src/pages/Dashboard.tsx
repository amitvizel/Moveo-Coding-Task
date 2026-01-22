import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import CoinPrices from '../components/CoinPrices';
import MarketNews from '../components/MarketNews';

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastFetch, setLastFetch] = useState<number>(0);

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
        setData(response.data);
        setLastFetch(now);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard');
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

  const handleRefresh = () => {
    setLastFetch(0); // Reset timestamp to force refresh
    setData(null); // Clear data to show loading
  };

  const getTimeSinceUpdate = () => {
    if (!lastFetch) return '';
    const seconds = Math.floor((Date.now() - lastFetch) / 1000);
    if (seconds < 60) return `Updated ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `Updated ${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Crypto Advisor Dashboard
            </h1>
            {lastFetch > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {getTimeSinceUpdate()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <span className="mr-2">🔄</span>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Auto-refreshes every 60s
            </span>
          </p>
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

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">AI Insight</h3>
            <p className="text-gray-700">{data?.aiInsight}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Meme of the Day</h3>
            {data?.meme && (
              <div>
                <p className="text-sm text-gray-600 mb-2">{data.meme.title}</p>
                <img 
                  src={data.meme.url} 
                  alt={data.meme.title}
                  className="w-full h-48 object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
