export class TrackFeatureDto {
  energy!: number;
  valence!: number;
  danceability!: number;
  acousticness!: number;
  instrumentalness!: number;
  tempo!: number;
}

export class RecommendedTrackDto {
  id!: string;
  title!: string;
  artist!: string;
  album?: string | null;
  genre!: string;
  popularity!: number;
  features!: TrackFeatureDto;
  explanation?: string;
  reason?: string;
}

export class RecommendationResponseDto {
  playlistId!: string;
  playlistName!: string;
  objective!: string;
  mood!: string;
  energyLevel!: string;
  generatedAt!: Date;
  tracks!: RecommendedTrackDto[];
  totalTracks!: number;
  mlModelScore?: number;
  explanation?: string;
}

export class AutomaticRecommendationDto {
  userId!: string;
  playlistId!: string;
  playlistName!: string;
  objective!: string;
  energyLevel!: string;
  generatedAt!: Date;
  tracks!: RecommendedTrackDto[];
  totalTracks!: number;
}
