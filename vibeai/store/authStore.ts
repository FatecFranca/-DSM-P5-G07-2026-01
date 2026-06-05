import { create } from 'zustand';
import { User } from '@/types';

export const MOCK_AUTH = {
  email: 'teste@vibeai.com',
  password: '12345678',
  user: {
    id: 'mock-user-1',
    name: 'Thiago',
    lastName: 'Teste',
    email: 'teste@vibeai.com',
    birthDate: '01/01/2000',
    createdAt: '2026-06-05T00:00:00.000Z',
  } satisfies User,
  token: 'mock-token-vibeai',
};

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));
