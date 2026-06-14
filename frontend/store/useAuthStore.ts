import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => {
        if (!user) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            user = { id: payload.userId, username: payload.username };
          } catch (e) {
            console.error('Failed to parse JWT', e);
          }
        }
        set({ token, user: user || null });
      },
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
