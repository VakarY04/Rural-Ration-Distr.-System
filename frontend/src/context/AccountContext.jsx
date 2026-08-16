import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [accountRes, profileRes] = await Promise.all([
        fetch('http://localhost:5000/api/auth/me', { headers }),
        fetch('http://localhost:5000/api/family/profile', { headers }),
      ]);
      const accountData = accountRes.ok ? await accountRes.json() : null;
      const profileData = profileRes.ok ? await profileRes.json() : null;
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
    refresh();
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
