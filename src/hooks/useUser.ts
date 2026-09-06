import { useState, useEffect, useCallback } from 'react';
import { userRepository } from '@/database/repositories';
import type { User } from '@/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userRepository.ensureUser();
      setUser(data);
    } catch (e) {
      setError('Não foi possível carregar os dados do usuário.');
      console.error('useUser error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      await userRepository.updateUser(data);
      await load();
    } catch (e) {
      console.error('updateUser error:', e);
      throw e;
    }
  }, [load]);

  return { user, loading, error, reload: load, updateUser };
}
