export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  birthDate: string;
  createdAt: string;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  genre: string;
  spotifyId: string;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  popularity: number;
}

export interface Vibe {
  id: string;
  name: string;
  description: string;
  objective: 'focus' | 'workout' | 'relax' | 'mood';
  energyLevel: 'low' | 'medium' | 'high';
  mood: 'happy' | 'neutral' | 'anxious' | 'sad';
  tracks: Track[];
  createdAt: string;
}

export interface VibeRequest {
  objective: Vibe['objective'];
  energyLevel: Vibe['energyLevel'];
  mood: Vibe['mood'];
}

export type FeedbackType = 'like' | 'dislike';

export interface Feedback {
  trackId: string;
  userId: string;
  type: FeedbackType;
  context: Vibe['objective'];
}