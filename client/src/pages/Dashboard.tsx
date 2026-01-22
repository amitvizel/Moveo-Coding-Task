import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

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

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await client.get('/dashboard/data');
        setData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          <button
            onClick={logout}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Logout
          </button>
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
        </div>

        {/* Dashboard Grid - Will hold 4 components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placeholder sections - will be replaced with components */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Coin Prices</h3>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(data?.prices, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Market News</h3>
            <pre className="text-sm text-gray-600 overflow-auto max-h-64">
              {JSON.stringify(data?.news?.slice(0, 3), null, 2)}
            </pre>
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
