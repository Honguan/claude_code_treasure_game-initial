import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  password: string;
  confirm: string;
}

export default function AuthPage() {
  const { login, enterGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  async function handleLogin(data: LoginForm) {
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setServerError(body.error ?? '登入失敗');
        return;
      }
      login(body.token, body.user);
      toast.success(`歡迎回來，${body.user.username}！`);
    } catch {
      setServerError('無法連線到伺服器，請確認後端是否啟動');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(data: RegisterForm) {
    if (data.password !== data.confirm) {
      registerForm.setError('confirm', { message: '兩次密碼不一致' });
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setServerError(body.error ?? '註冊失敗');
        return;
      }
      login(body.token, body.user);
      toast.success(`註冊成功！歡迎，${body.user.username}！`);
    } catch {
      setServerError('無法連線到伺服器，請確認後端是否啟動');
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: 'login' | 'register') {
    setMode(m);
    setServerError('');
    loginForm.clearErrors();
    registerForm.clearErrors();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl mb-8 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>

      <div className="w-full max-w-md">
        {/* Tab buttons */}
        <div className="flex rounded-xl overflow-hidden border-2 border-amber-300 mb-4">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            註冊
          </button>
        </div>

        {/* Card */}
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-xl p-6 shadow-lg">

          {/* Server error */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">登入帳號</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="l-username" className="text-amber-800 mb-1 block">用戶名</Label>
                  <Input
                    id="l-username"
                    placeholder="輸入用戶名"
                    {...loginForm.register('username', { required: '請輸入用戶名' })}
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-red-600 text-xs mt-1">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="l-password" className="text-amber-800 mb-1 block">密碼</Label>
                  <Input
                    id="l-password"
                    type="password"
                    placeholder="輸入密碼"
                    {...loginForm.register('password', { required: '請輸入密碼' })}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-600 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? '登入中...' : '登入'}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} noValidate>
              <h2 className="text-xl font-semibold text-amber-900 mb-4">建立帳號</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="r-username" className="text-amber-800 mb-1 block">用戶名</Label>
                  <Input
                    id="r-username"
                    placeholder="3-20 個英數字或底線"
                    {...registerForm.register('username', {
                      required: '請輸入用戶名',
                      pattern: { value: /^[a-zA-Z0-9_]{3,20}$/, message: '用戶名需為 3-20 個英數字或底線' },
                    })}
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-red-600 text-xs mt-1">{registerForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="r-password" className="text-amber-800 mb-1 block">密碼</Label>
                  <Input
                    id="r-password"
                    type="password"
                    placeholder="至少 6 個字元"
                    {...registerForm.register('password', {
                      required: '請輸入密碼',
                      minLength: { value: 6, message: '密碼至少需要 6 個字元' },
                    })}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-red-600 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="r-confirm" className="text-amber-800 mb-1 block">確認密碼</Label>
                  <Input
                    id="r-confirm"
                    type="password"
                    placeholder="再次輸入密碼"
                    {...registerForm.register('confirm', { required: '請再次輸入密碼' })}
                  />
                  {registerForm.formState.errors.confirm && (
                    <p className="text-red-600 text-xs mt-1">{registerForm.formState.errors.confirm.message}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? '註冊中...' : '建立帳號'}
              </Button>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={enterGuest}
          className="mt-6 w-full text-amber-700 hover:text-amber-900 underline text-sm transition-colors"
        >
          以訪客模式繼續（不儲存紀錄）
        </button>
      </div>
    </div>
  );
}
