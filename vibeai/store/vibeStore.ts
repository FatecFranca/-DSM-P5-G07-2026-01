import { create } from 'zustand';
import { Vibe, Track } from '@/types';

interface VibeRequest {
  objective: string;
  energyLevel: string;
  mood: string;
}

interface VibeState {
  currentVibe: Vibe | null;
  vibeRequest: VibeRequest | null;
  generatedTracks: Track[];
  setVibeRequest: (request: VibeRequest) => void;
  setCurrentVibe: (vibe: Vibe) => void;
  setGeneratedTracks: (tracks: Track[]) => void;
  clear: () => void;
}

export const useVibeStore = create<VibeState>((set) => ({
  currentVibe: null,
  vibeRequest: null,
  generatedTracks: [],
  setVibeRequest: (request) => set({ vibeRequest: request }),
  setCurrentVibe: (vibe) => set({ currentVibe: vibe }),
  setGeneratedTracks: (tracks) => set({ generatedTracks: tracks }),
  clear: () => set({ currentVibe: null, vibeRequest: null, generatedTracks: [] }),
}));