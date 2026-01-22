import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { UserPreferences } from '../context/AuthContext';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [favoriteCoins, setFavoriteCoins] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<UserPreferences['riskTolerance']>('moderate');
  const [contentFocus, setContentFocus] = useState<UserPreferences['contentFocus']>([]);

  // Available Options
  const coinOptions = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE', 'XRP', 'DOT', 'MATIC'];
  const contentOptions: { value: 'news' | 'technical' | 'memes'; label: string }[] = [
    { value: 'news', label: 'Market News' },
    { value: 'technical', label: 'Technical Analysis' },
    { value: 'memes', label: 'Memes & Fun' },
  ];

  const toggleCoin = (coin: string) => {
    setFavoriteCoins((prev) =>
      prev.includes(coin) ? prev.filter((c) => c !== coin) : [...prev, coin]
    );
  };

  const toggleContent = (content: 'news' | 'technical' | 'memes') => {
    setContentFocus((prev) =>
      prev.includes(content) ? prev.filter((c) => c !== content) : [...prev, content]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const preferences: UserPreferences = {
        favoriteCoins,
        riskTolerance,
        contentFocus,
      };

      const response = await client.put('/user/preferences', { preferences });
      
      // Update local user state
      if (user) {
        updateUser({ ...user, preferences });
      }
      
      console.log('Preferences updated:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Failed to save preferences', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome!</h1>
        <p className="text-center text-gray-600 mb-8">Let's personalize your experience.</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select your favorite coins:</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {coinOptions.map((coin) => (
                <button
                  key={coin}
                  onClick={() => toggleCoin(coin)}
                  className={`p-3 rounded border transition-colors ${
                    favoriteCoins.includes(coin)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={favoriteCoins.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">What's your risk tolerance?</h2>
            <div className="space-y-3 mb-6">
              {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskTolerance(risk)}
                  className={`w-full p-4 text-left rounded border transition-colors ${
                    riskTolerance === risk
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize font-medium">{risk}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">What content do you want to see?</h2>
            <div className="space-y-3 mb-6">
              {contentOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleContent(option.value)}
                  className={`w-full p-4 text-left rounded border transition-colors ${
                    contentFocus.includes(option.value)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || contentFocus.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
