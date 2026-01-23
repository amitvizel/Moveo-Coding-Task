import React from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferencesForm } from '../hooks/usePreferencesForm';

interface EditPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPreferencesModal: React.FC<EditPreferencesModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const {
    favoriteCoins,
    investorType,
    contentPreferences,
    loading,
    error,
    setInvestorType,
    toggleCoin,
    toggleContent,
    handleSubmit,
    coinOptions,
    contentOptions,
    investorTypes,
  } = usePreferencesForm({
    initialPreferences: isOpen ? (user?.preferences || null) : null,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Preferences</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Favorite Coins Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Favorite Coins</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {coinOptions.map((coin) => (
                <button
                  key={coin}
                  onClick={() => toggleCoin(coin)}
                  className={`p-2 text-sm rounded border transition-colors ${
                    favoriteCoins.includes(coin)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
            {favoriteCoins.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Select at least one coin.</p>
            )}
          </div>

          {/* Investor Type Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Investor Type</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {investorTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setInvestorType(type)}
                  className={`flex-1 p-3 text-center rounded border transition-colors ${
                    investorType === type
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Preferences Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Content Preferences</h3>
            <div className="space-y-2">
              {contentOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleContent(option.value)}
                  className={`w-full p-3 text-left rounded border transition-colors flex items-center ${
                    contentPreferences.includes(option.value)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-5 h-5 mr-3 border rounded flex items-center justify-center ${
                    contentPreferences.includes(option.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                  }`}>
                    {contentPreferences.includes(option.value) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
            {contentPreferences.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Select at least one content type.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || favoriteCoins.length === 0 || contentPreferences.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPreferencesModal;
