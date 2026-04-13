import { useState, useEffect, useCallback, useRef } from 'react';
import * as SecureStore from '@/utils/SecureStore';

interface UserStatistics {
  account_age_in_days: number;
  lobbies_created: number;
  lobbies_joined: number;
  games_voted_on: number;
  last_login: string | null;
  most_liked_game: { name: string; count: number } | null;
  most_disliked_game: { name: string; count: number } | null;
}

export function useUserStatistics() {
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/userStatistics`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await SecureStore.getItemAsync('token')}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatistics(data.statistics);
      } else {
        setError(data.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordLogin = useCallback(async () => {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/recordLogin`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await SecureStore.getItemAsync('token')}`,
          },
        }
      );
    } catch (err) {
      console.error('Failed to record login:', err);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
    recordLogin();
  }, [fetchStatistics, recordLogin]);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
}