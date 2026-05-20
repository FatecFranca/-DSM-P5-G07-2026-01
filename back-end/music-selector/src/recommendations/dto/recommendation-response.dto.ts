import { ApiProperty } from '@nestjs/swagger';

export class TrackFeatureDto {
  @ApiProperty({ example: 0.75, description: 'Energia da faixa (0.0-1.0)' })
  energy!: number;

  @ApiProperty({ example: 0.65, description: 'Alegria/Valência (0.0-1.0)' })
  valence!: number;

  @ApiProperty({ example: 0.7, description: 'Danceability (0.0-1.0)' })
  danceability!: number;

  @ApiProperty({ example: 0.3, description: 'Acústica (0.0-1.0)' })
  acousticness!: number;

  @ApiProperty({ example: 0.15, description: 'Instrumentalidade (0.0-1.0)' })
  instrumentalness!: number;

  @ApiProperty({ example: 120, description: 'Tempo em BPM' })
  tempo!: number;
}

export class RecommendedTrackDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Blinding Lights' })
  title!: string;

  @ApiProperty({ example: 'The Weeknd' })
  artist!: string;

  @ApiProperty({ example: 'After Hours', required: false })
  album?: string | null;

  @ApiProperty({ example: 'Synth-pop' })
  genre!: string;

  @ApiProperty({ example: 84 })
  popularity!: number;

  @ApiProperty({ type: TrackFeatureDto })
  features!: TrackFeatureDto;

  @ApiProperty({
    example: '80% de energia, ideal para seu treino',
    required: false,
  })
  explanation?: string;

  @ApiProperty({
    example: 'Sugerida por ter valência alta (feliz/animada)',
    required: false,
  })
  reason?: string;
}

export class RecommendationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  playlistId!: string;

  @ApiProperty({ example: 'My Focus Vibe' })
  playlistName!: string;

  @ApiProperty({ example: 'FOCUS' })
  objective!: string;

  @ApiProperty({ example: 'HAPPY' })
  mood!: string;

  @ApiProperty({ example: 'HIGH' })
  energyLevel!: string;

  @ApiProperty({ example: '2026-05-20T10:30:00Z' })
  generatedAt!: Date;

  @ApiProperty({ type: [RecommendedTrackDto] })
  tracks!: RecommendedTrackDto[];

  @ApiProperty({ example: 10 })
  totalTracks!: number;

  @ApiProperty({ example: 0.89, required: false })
  mlModelScore?: number;

  @ApiProperty({ example: 'Geradas com base no perfil e feedback', required: false })
  explanation?: string;
}

export class AutomaticRecommendationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  playlistId!: string;

  @ApiProperty({ example: 'Vibe Diária: Foco' })
  playlistName!: string;

  @ApiProperty({ example: 'FOCUS' })
  objective!: string;

  @ApiProperty({ example: 'MEDIUM' })
  energyLevel!: string;

  @ApiProperty({ example: '2026-05-20T09:00:00Z' })
  generatedAt!: Date;

  @ApiProperty({ type: [RecommendedTrackDto] })
  tracks!: RecommendedTrackDto[];

  @ApiProperty({ example: 10 })
  totalTracks!: number;
}
