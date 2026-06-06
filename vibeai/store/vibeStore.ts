import { create } from 'zustand';
import { Playlist, Track, VibeRequest } from '@/types';
import { api } from '@/services/api';

interface VibeState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  currentTrack: Track | null;
  vibeRequest: VibeRequest | null;
  isLoading: boolean;
  error: string | null;
  setVibeRequest: (request: VibeRequest) => void;
  setCurrentTrack: (track: Track | null) => void;
  loadHistory: (token: string) => Promise<void>;
  generatePlaylist: (token: string, request: VibeRequest) => Promise<Playlist>;
  loadPlaylistDetails: (token: string, playlistId: string) => Promise<Playlist>;
  deletePlaylist: (token: string, playlistId: string) => Promise<void>;
  clear: () => void;
}

export const useVibeStore = create<VibeState>((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  currentTrack: null,
  vibeRequest: null,
  isLoading: false,
  error: null,
  setVibeRequest: (request) => set({ vibeRequest: request }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  loadHistory: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const playlists = await api.getPlaylistHistory(token);
      set({ playlists, isLoading: false });
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível carregar suas vibes.', isLoading: false });
      throw error;
    }
  },
  generatePlaylist: async (token, request) => {
    set({ isLoading: true, error: null, vibeRequest: request });
    try {
      const playlist = await api.generateRecommendations(token, request);
      set((state) => ({
        playlists: [playlist, ...state.playlists.filter((item) => item.id !== playlist.id)],
        currentPlaylist: playlist,
        isLoading: false,
      }));
      return playlist;
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível gerar sua vibe.', isLoading: false });
      throw error;
    }
  },
  loadPlaylistDetails: async (token, playlistId) => {
    const cached = get().playlists.find((playlist) => playlist.id === playlistId);
    if (cached?.tracks.length) {
      set({ currentPlaylist: cached });
      return cached;
    }

    set({ isLoading: true, error: null });
    try {
      const playlist = await api.getPlaylistDetails(token, playlistId);
      set((state) => ({
        playlists: [playlist, ...state.playlists.filter((item) => item.id !== playlist.id)],
        currentPlaylist: playlist,
        isLoading: false,
      }));
      return playlist;
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível abrir essa vibe.', isLoading: false });
      throw error;
    }
  },
  deletePlaylist: async (token, playlistId) => {
    set({ isLoading: true, error: null });
    try {
      await api.deletePlaylist(token, playlistId);
      set((state) => ({
        playlists: state.playlists.filter((playlist) => playlist.id !== playlistId),
        currentPlaylist: state.currentPlaylist?.id === playlistId ? null : state.currentPlaylist,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error?.message ?? 'Não foi possível excluir essa vibe.', isLoading: false });
      throw error;
    }
  },
  clear: () => set({
    playlists: [],
    currentPlaylist: null,
    currentTrack: null,
    vibeRequest: null,
    error: null,
    isLoading: false,
  }),
}));
