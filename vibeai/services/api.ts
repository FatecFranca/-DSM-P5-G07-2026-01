import { EnergyLevelType, MoodType, ObjectiveType, Playlist, Track, User, VibeRequest } from '@/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

type ApiOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

function getErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message: string | string[] }).message;
    return Array.isArray(message) ? message.join('\n') : message;
  }

  return `Erro na comunicação com o servidor (${status}).`;
}

export const api = {
  async login(email: string, password: string) {
    const response = await apiRequest<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return {
      token: response.access_token,
      user: normalizeUser(response.user),
    };
  },

  async register(data: {
    name: string;
    email: string;
    emailConfirmation: string;
    password: string;
    passwordConfirmation: string;
    dateOfBirth: string;
  }) {
    return apiRequest<{ id: string; name: string; email: string; message: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string) {
    return apiRequest<{ message: string }>('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string, passwordConfirmation: string) {
    return apiRequest<{ message: string }>('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password, passwordConfirmation }),
    });
  },

  async generateRecommendations(token: string, request: VibeRequest) {
    const response = await apiRequest<BackendGeneratedPlaylist>('/api/recommendations/generate', {
      method: 'POST',
      token,
      body: JSON.stringify(request),
    });

    return normalizeGeneratedPlaylist(response);
  },

  async getPlaylistHistory(token: string, limit = 20) {
    const response = await apiRequest<BackendStoredPlaylist[]>(`/api/recommendations/history?limit=${limit}`, {
      token,
    });

    return response.map(normalizeStoredPlaylist);
  },

  async getPlaylistDetails(token: string, playlistId: string) {
    const response = await apiRequest<BackendGeneratedPlaylist | BackendStoredPlaylist>(
      `/api/recommendations/${playlistId}`,
      { token },
    );

    return isStoredPlaylist(response) ? normalizeStoredPlaylist(response) : normalizeGeneratedPlaylist(response);
  },

  async deletePlaylist(token: string, playlistId: string) {
    return apiRequest<{ message: string }>(`/api/recommendations/${playlistId}`, {
      method: 'DELETE',
      token,
    });
  },

  async deleteAccount(token: string, userId: string) {
    return apiRequest<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
      token,
    });
  },

  async logout(token: string) {
    return apiRequest<{ message: string }>('/users/logout', {
      method: 'POST',
      token,
    });
  },
};

type BackendTrack = {
  id: string;
  title?: string;
  artist?: string;
  album?: string;
  popularity?: number;
  features?: Track['features'];
  explanation?: string;
  trackName?: string;
  artists?: string;
  albumName?: string;
  energy?: number;
  valence?: number;
  danceability?: number;
  acousticness?: number;
  instrumentalness?: number;
  speechiness?: number;
  tempo?: number;
};

type BackendGeneratedPlaylist = {
  playlistId: string;
  playlistName: string;
  objective?: ObjectiveType;
  mood: MoodType;
  energyLevel: EnergyLevelType;
  predictedVibe?: string;
  generatedAt: string;
  tracks: BackendTrack[];
  totalTracks?: number;
  mlModelScore?: number;
};

type BackendStoredPlaylist = {
  id: string;
  name: string;
  mood: MoodType;
  energyLevel: EnergyLevelType;
  type?: string;
  generatedAt: string;
  tracks: Array<{
    position: number;
    track: BackendTrack;
  }>;
};

function isStoredPlaylist(value: BackendGeneratedPlaylist | BackendStoredPlaylist): value is BackendStoredPlaylist {
  return 'id' in value && !('playlistId' in value);
}

function normalizeUser(user: User): User {
  return {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    birthDate: user.birthDate,
    createdAt: user.createdAt,
  };
}

function normalizeGeneratedPlaylist(playlist: BackendGeneratedPlaylist): Playlist {
  return {
    id: playlist.playlistId,
    name: normalizePlaylistName(playlist.playlistName, playlist.objective),
    objective: playlist.objective,
    mood: playlist.mood,
    energyLevel: playlist.energyLevel,
    predictedVibe: playlist.predictedVibe,
    generatedAt: String(playlist.generatedAt),
    tracks: playlist.tracks.map(normalizeTrack),
    totalTracks: playlist.totalTracks ?? playlist.tracks.length,
    mlModelScore: playlist.mlModelScore,
  };
}

function normalizeStoredPlaylist(playlist: BackendStoredPlaylist): Playlist {
  const tracks = playlist.tracks
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => normalizeTrack(item.track));

  return {
    id: playlist.id,
    name: normalizePlaylistName(playlist.name),
    mood: playlist.mood,
    energyLevel: playlist.energyLevel,
    generatedAt: String(playlist.generatedAt),
    tracks,
    totalTracks: tracks.length,
  };
}

function normalizePlaylistName(name: string, objective?: ObjectiveType) {
  const objectiveNames: Record<ObjectiveType, string> = {
    FOCUS: 'Foco',
    WORKOUT: 'Energia',
    RELAX: 'Calma',
    MOOD_BOOST: 'Bom humor',
  };

  if (objective) {
    return objectiveNames[objective];
  }

  const legacyName = name.trim();

  if (/^focus\s+.+\s+vibe$/i.test(legacyName)) {
    return objectiveNames.FOCUS;
  }

  if (/^workout\s+.+\s+vibe$/i.test(legacyName)) {
    return objectiveNames.WORKOUT;
  }

  if (/^relax\s+.+\s+vibe$/i.test(legacyName)) {
    return objectiveNames.RELAX;
  }

  if (/^mood boost\s+.+\s+vibe$/i.test(legacyName)) {
    return objectiveNames.MOOD_BOOST;
  }

  return name;
}

function normalizeTrack(track: BackendTrack): Track {
  const features = track.features ?? {
    energy: track.energy ?? 0,
    valence: track.valence ?? 0,
    danceability: track.danceability ?? 0,
    acousticness: track.acousticness ?? 0,
    instrumentalness: track.instrumentalness ?? 0,
    speechiness: track.speechiness,
    tempo: track.tempo,
  };

  return {
    id: track.id,
    title: track.title ?? track.trackName ?? 'Faixa sem título',
    artist: track.artist ?? track.artists ?? 'Artista desconhecido',
    album: track.album ?? track.albumName ?? 'Álbum desconhecido',
    popularity: track.popularity ?? 0,
    features,
    explanation: track.explanation,
    cover: getTrackCover(track.id),
  };
}

function getTrackCover(trackId: string) {
  const covers = [
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=160&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=160&q=80',
    'https://images.unsplash.com/photo-1493225457124-a1a2a5f5287f?w=160&q=80',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=160&q=80',
  ];
  const index = [...trackId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % covers.length;
  return covers[index];
}

export function getPlaylistArtwork(playlist: Pick<Playlist, 'predictedVibe' | 'objective' | 'energyLevel'>) {
  const key = playlist.predictedVibe ?? playlist.objective ?? playlist.energyLevel;

  if (key === 'WORKOUT' || key === 'HIGH') {
    return {
      image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=85',
      gradientColors: ['#F472B6', '#BE185D'] as const,
    };
  }

  if (key === 'RELAX' || key === 'CHILL' || key === 'LOW') {
    return {
      image: 'https://images.unsplash.com/photo-1573603088895-d399fbee9653?w=900&q=85',
      gradientColors: ['#22D3EE', '#0369A1'] as const,
    };
  }

  if (key === 'FOCUS') {
    return {
      image: 'https://images.unsplash.com/photo-1529421308418-eab98863cee4?w=900&q=85',
      gradientColors: ['#7C3AED', '#4338CA'] as const,
    };
  }

  return {
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=85',
    gradientColors: ['#7C3AED', '#22D3EE'] as const,
  };
}
