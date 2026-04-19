import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppView = 'auth' | 'game' | 'leaderboard';

interface AuthUser {
  id: number;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isGuest: boolean;
  token: string | null;
  view: AppView;
  setView: (v: AppView) => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  enterGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'treasure_jwt';

function decodeToken(token: string): { sub: number; username: string; exp: number } | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [view, setView] = useState<AppView>('auth');

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const payload = decodeToken(stored);
      if (payload && payload.exp * 1000 > Date.now()) {
        setToken(stored);
        setUser({ id: payload.sub, username: payload.username });
        setView('game');
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setIsGuest(false);
    setView('game');
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsGuest(false);
    setView('auth');
  }

  function enterGuest() {
    setIsGuest(true);
    setUser(null);
    setToken(null);
    setView('game');
  }

  return (
    <AuthContext.Provider value={{ user, isGuest, token, view, setView, login, logout, enterGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
