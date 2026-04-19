import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface LeaderboardEntry {
  rank: number;
  username: string;
  best_score: number;
  games_played: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { user, setView } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => {
        setError('無法載入排行榜');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl text-amber-900">🏆 排行榜</h2>
          <Button
            onClick={() => setView('game')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            回到遊戲
          </Button>
        </div>

        {loading && <p className="text-amber-700 text-center py-8">載入中...</p>}
        {error && <p className="text-red-600 text-center py-8">{error}</p>}

        {!loading && !error && entries.length === 0 && (
          <p className="text-amber-700 text-center py-8">還沒有任何紀錄，快去玩第一局吧！</p>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-200 text-amber-900">
                  <th className="py-3 px-4 text-left">排名</th>
                  <th className="py-3 px-4 text-left">用戶名</th>
                  <th className="py-3 px-4 text-right">最高分</th>
                  <th className="py-3 px-4 text-right">遊戲次數</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const isMe = user?.username === entry.username;
                  return (
                    <tr
                      key={entry.rank}
                      className={`border-t border-amber-200 ${isMe ? 'bg-amber-200/60 font-semibold' : 'hover:bg-amber-100/60'}`}
                    >
                      <td className="py-3 px-4 text-amber-800">
                        {MEDALS[entry.rank - 1] ?? entry.rank}
                      </td>
                      <td className="py-3 px-4 text-amber-900">
                        {entry.username} {isMe && <span className="text-xs text-amber-600">(你)</span>}
                      </td>
                      <td className={`py-3 px-4 text-right ${entry.best_score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${entry.best_score}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-700">{entry.games_played}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
