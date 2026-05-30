import { create } from 'zustand';

interface OnboardingState {
  genres: string[];
  listeningStyle: string | null;
  vocalPreference: string;
  isCompleted: boolean;
  setGenres: (genres: string[]) => void;
  setListeningStyle: (style: string) => void;
  setVocalPreference: (pref: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  genres: [],
  listeningStyle: null,
  vocalPreference: 'Misto',
  isCompleted: false,
  setGenres: (genres) => set({ genres }),
  setListeningStyle: (style) => set({ listeningStyle: style }),
  setVocalPreference: (pref) => set({ vocalPreference: pref }),
  completeOnboarding: () => set({ isCompleted: true }),
  reset: () => set({ genres: [], listeningStyle: null, vocalPreference: 'Misto', isCompleted: false }),
}));