import { create } from 'zustand';
import { Vibe, Track } from '@/types';

interface VibeRequest {
  objective: string;
  energyLevel: string;
  mood: string;
}

export interface SavedVibe {
  id: string;
  title: string;
  desc: string;
  energy: string;
  mood: string;
  gradientColors: readonly [string, string];
  image: string;
  createdAt: string;
}

interface VibeState {
  currentVibe: Vibe | null;
  vibeRequest: VibeRequest | null;
  generatedTracks: Track[];
  savedVibes: SavedVibe[];
  setVibeRequest: (request: VibeRequest) => void;
  setCurrentVibe: (vibe: Vibe) => void;
  setGeneratedTracks: (tracks: Track[]) => void;
  addSavedVibe: (vibe: SavedVibe) => void;
  removeSavedVibe: (id: string) => void;
  clear: () => void;
}

export const useVibeStore = create<VibeState>((set) => ({
  currentVibe: null,
  vibeRequest: null,
  generatedTracks: [],
  savedVibes: [],
  setVibeRequest: (request) => set({ vibeRequest: request }),
  setCurrentVibe: (vibe) => set({ currentVibe: vibe }),
  setGeneratedTracks: (tracks) => set({ generatedTracks: tracks }),
  addSavedVibe: (vibe) => set((state) => ({ savedVibes: [vibe, ...state.savedVibes] })),
  removeSavedVibe: (id) => set((state) => ({
    savedVibes: state.savedVibes.filter((vibe) => vibe.id !== id),
  })),
  clear: () => set({ currentVibe: null, vibeRequest: null, generatedTracks: [], savedVibes: [] }),
}));
