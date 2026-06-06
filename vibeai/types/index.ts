export interface User {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  birthDate?: string;
  createdAt?: string;
}

export type ObjectiveType = 'FOCUS' | 'WORKOUT' | 'RELAX' | 'MOOD_BOOST';
export type MoodType = 'HAPPY' | 'NEUTRAL' | 'ANXIOUS' | 'SAD';
export type EnergyLevelType = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TrackFeatures {
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  speechiness?: number;
  tempo?: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  popularity: number;
  features: TrackFeatures;
  explanation?: string;
  cover?: string;
}

export interface Playlist {
  id: string;
  name: string;
  objective?: ObjectiveType;
  mood: MoodType;
  energyLevel: EnergyLevelType;
  predictedVibe?: string;
  generatedAt: string;
  tracks: Track[];
  totalTracks: number;
  mlModelScore?: number;
}

export interface VibeRequest {
  objective: ObjectiveType;
  energyLevel: EnergyLevelType;
  mood: MoodType;
}

export type FeedbackType = 'like' | 'dislike';

export interface Feedback {
  trackId: string;
  userId: string;
  type: FeedbackType;
  context: ObjectiveType;
}
