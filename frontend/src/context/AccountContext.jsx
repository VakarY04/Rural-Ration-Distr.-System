/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AccountContext = createContext(null);

// Fetches the citizen's account + household summary once and shares it
// across every dashboard page, so the avatar/name/ration-card chip in the
// top bar always matches whatever was last saved on the Family Profile page.
export function AccountProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('ration_user_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [accountData, profileData] = await Promise.all([
        api('/auth/me'),
        api('/family/profile'),
      ]);
      setAccount({
        name: accountData?.name || 'Citizen',
        avatar: accountData?.avatar || null,
        rationCardNumber: profileData?.rationCardNumber || null,
      });
    } catch {
      // Leave previous state as-is on a transient network failure.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer so the initial fetch's setLoading fires outside the effect body.
    Promise.resolve().then(refresh);
  }, [refresh]);

  return (
    <AccountContext.Provider value={{ account, loading, refresh }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used within an AccountProvider');
  return ctx;
}
