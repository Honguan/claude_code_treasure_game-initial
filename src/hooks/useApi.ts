import { useAuth } from '../contexts/AuthContext';

export function useApi() {
  const { token } = useAuth();

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(path, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data as T;
  }

  return { apiFetch };
}
