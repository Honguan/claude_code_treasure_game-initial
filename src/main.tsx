import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import App from './App';
import AuthPage from './pages/AuthPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Navbar from './components/Navbar';
import './index.css';

function Router() {
  const { view, user, isGuest } = useAuth();

  if (view === 'auth' && !user && !isGuest) {
    return <AuthPage />;
  }

  if (view === 'leaderboard') {
    return (
      <>
        <Navbar />
        <LeaderboardPage />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <App />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Toaster position="top-center" richColors />
    <Router />
  </AuthProvider>
);
