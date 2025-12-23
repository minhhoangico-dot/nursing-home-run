import { useState } from 'react';
import { User } from '../../../types/index';
import { MOCK_USERS } from '../../../data/index';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string) => {
    const foundUser = MOCK_USERS.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };
};