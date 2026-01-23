import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { UserPreferences } from '../context/AuthContext';
import { COIN_OPTIONS, CONTENT_PREFERENCES, INVESTOR_TYPES } from '../constants';
import { getErrorMessage } from '../types/errors';

interface UsePreferencesFormOptions {
  initialPreferences?: UserPreferences | null;
  onSuccess?: () => void;
}

export const usePreferencesForm = ({ initialPreferences, onSuccess }: UsePreferencesFormOptions = {}) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [favoriteCoins, setFavoriteCoins] = useState<string[]>(initialPreferences?.favoriteCoins || []);
  const [investorType, setInvestorType] = useState<UserPreferences['investorType']>(
    initialPreferences?.investorType || 'HODLer'
  );
  const [contentPreferences, setContentPreferences] = useState<UserPreferences['contentPreferences']>(
    initialPreferences?.contentPreferences || []
  );

  useEffect(() => {
    if (initialPreferences) {
      setFavoriteCoins(initialPreferences.favoriteCoins || []);
      setInvestorType(initialPreferences.investorType || 'HODLer');
      setContentPreferences(initialPreferences.contentPreferences || []);
      setError('');
    } else {
      setFavoriteCoins([]);
      setInvestorType('HODLer');
      setContentPreferences([]);
      setError('');
    }
  }, [initialPreferences]);

  const toggleCoin = (coin: string) => {
    setFavoriteCoins((prev) =>
      prev.includes(coin) ? prev.filter((c) => c !== coin) : [...prev, coin]
    );
    setError('');
  };

  const toggleContent = (content: UserPreferences['contentPreferences'][number]) => {
    setContentPreferences((prev) =>
      prev.includes(content) ? prev.filter((c) => c !== content) : [...prev, content]
    );
    setError('');
  };

  const validate = (): string | null => {
    if (favoriteCoins.length === 0) {
      return 'Please select at least one coin.';
    }
    if (contentPreferences.length === 0) {
      return 'Please select at least one content type.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const preferences: UserPreferences = {
        favoriteCoins,
        investorType,
        contentPreferences,
      };

      await client.put('/user/preferences', { preferences });
      
      if (user) {
        updateUser({ ...user, preferences });
      }
      
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'Failed to save preferences. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    favoriteCoins,
    investorType,
    contentPreferences,
    loading,
    error,
    setInvestorType,
    toggleCoin,
    toggleContent,
    handleSubmit,
    coinOptions: COIN_OPTIONS,
    contentOptions: CONTENT_PREFERENCES,
    investorTypes: INVESTOR_TYPES,
  };
};
