import { Trophy, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export default function Navbar() {
  const { user, isGuest, setView, logout } = useAuth();

  return (
    <header className="w-full bg-amber-800 text-amber-50 px-6 py-3 flex items-center justify-between shadow-md">
      <span className="font-bold text-lg tracking-wide">🏴‍☠️ Treasure Hunt</span>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-amber-200 text-sm">👤 {user.username}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setView('leaderboard')}
              className="text-amber-100 hover:text-white hover:bg-amber-700 gap-1"
            >
              <Trophy size={16} />
              排行榜
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={logout}
              className="text-amber-100 hover:text-white hover:bg-amber-700 gap-1"
            >
              <LogOut size={16} />
              登出
            </Button>
          </>
        ) : isGuest ? (
          <>
            <span className="text-amber-300 text-sm">訪客模式</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={logout}
              className="text-amber-100 hover:text-white hover:bg-amber-700 gap-1"
            >
              <LogIn size={16} />
              登入 / 註冊
            </Button>
          </>
        ) : null}
      </div>
    </header>
  );
}
