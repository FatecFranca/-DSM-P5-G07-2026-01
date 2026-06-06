import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    emailConfirmation: string;
    password: string;
    passwordConfirmation: string;
    dateOfBirth: string;
  }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, password: string, passwordConfirmation: string) => Promise<string>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  clearError: () => set({ error: null }),
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await api.login(email.trim().toLowerCase(), password);
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ error: 'Login ou senha estão incorretos.', isLoading: false });
      throw error;
    }
  },
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível criar sua conta.', isLoading: false });
      throw error;
    }
  },
  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.forgotPassword(email.trim().toLowerCase());
      set({ isLoading: false });
      return response.message;
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível solicitar a recuperação.', isLoading: false });
      throw error;
    }
  },
  resetPassword: async (token, password, passwordConfirmation) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.resetPassword(token, password, passwordConfirmation);
      set({ isLoading: false });
      return response.message;
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível redefinir sua senha.', isLoading: false });
      throw error;
    }
  },
  deleteAccount: async () => {
    const { token, user } = get();
    if (!token || !user) return;

    set({ isLoading: true, error: null });
    try {
      await api.deleteAccount(token, user.id);
      set({ user: null, token: null, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível excluir sua conta.', isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    const { token } = get();
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // JWT pode expirar antes do logout; a sessão local ainda deve ser limpa.
      }
    }

    set({ user: null, token: null, error: null, isLoading: false });
  },
}));
