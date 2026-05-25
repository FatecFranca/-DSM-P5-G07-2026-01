import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * RN10-RN13: Wizard de Onboarding - Campos Obrigatórios
 * RN10: Obrigatório na primeira vez
 * RN11: 1-5 gêneros
 * RN12: Preferência de áudio
 * RN13: Cold Start mitigation
 */
export class CompleteOnboardingDto {
  @ApiProperty({
    example: ['pop', 'rock', 'indie'],
    description: 'RN11: Lista de 1-5 gêneros (cold start mitigation)',
    type: [String],
    minItems: 1,
    maxItems: 5,
  })
  @IsArray({ message: '❌ Gêneros devem ser uma lista' })
  @ArrayMinSize(1, { message: '❌ Selecione pelo menos 1 gênero (RN11)' })
  @ArrayMaxSize(5, { message: '❌ Máximo 5 gêneros (RN11)' })
  @IsString({ each: true, message: '❌ Cada gênero deve ser texto' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    each: true,
    message: '❌ Gênero com formato inválido',
  })
  favoriteGenres!: string[];

  @ApiProperty({
    example: 'mixed',
    description: 'RN12: Preferência de áudio (instrumental/mixed/vocal)',
    enum: ['instrumental', 'mixed', 'vocal'],
    enumName: 'AudioPreference',
  })
  @IsNotEmpty({ message: '❌ Preferência de áudio é obrigatória' })
  @Matches(/^(instrumental|mixed|vocal)$/i, {
    message: '❌ Deve ser: instrumental, mixed ou vocal',
  })
  audioPreference!: string;

  @ApiProperty({ example: 0.7, description: 'Danceability (0.0-1.0)' })
  @IsNotEmpty({ message: '❌ Danceability é obrigatória' })
  @IsNumber({}, { message: '❌ Danceability deve ser número' })
  @Min(0, { message: '❌ Danceability deve ser >= 0' })
  @Max(1, { message: '❌ Danceability deve ser <= 1' })
  danceability!: number;

  @ApiProperty({ example: 0.8, description: 'Energy (0.0-1.0)' })
  @IsNotEmpty({ message: '❌ Energy é obrigatória' })
  @IsNumber({}, { message: '❌ Energy deve ser número' })
  @Min(0, { message: '❌ Energy deve ser >= 0' })
  @Max(1, { message: '❌ Energy deve ser <= 1' })
  energy!: number;

  @ApiProperty({ example: 0.6, description: 'Valence (0.0-1.0)' })
  @IsNotEmpty({ message: '❌ Valence é obrigatória' })
  @IsNumber({}, { message: '❌ Valence deve ser número' })
  @Min(0, { message: '❌ Valence deve ser >= 0' })
  @Max(1, { message: '❌ Valence deve ser <= 1' })
  valence!: number;

  @ApiProperty({ example: 0.4, description: 'Acousticness (0.0-1.0)' })
  @IsNotEmpty({ message: '❌ Acousticness é obrigatória' })
  @IsNumber({}, { message: '❌ Acousticness deve ser número' })
  @Min(0, { message: '❌ Acousticness deve ser >= 0' })
  @Max(1, { message: '❌ Acousticness deve ser <= 1' })
  acousticness!: number;

  @ApiProperty({ example: 0.2, description: 'Instrumentalness (0.0-1.0)' })
  @IsNotEmpty({ message: '❌ Instrumentalness é obrigatória' })
  @IsNumber({}, { message: '❌ Instrumentalness deve ser número' })
  @Min(0, { message: '❌ Instrumentalness deve ser >= 0' })
  @Max(1, { message: '❌ Instrumentalness deve ser <= 1' })
  instrumentalness!: number;

  @ApiProperty({ example: 0.1, description: 'Speechiness (0.0-1.0)' })
  @IsNotEmpty({ message: '❌ Speechiness é obrigatória' })
  @IsNumber({}, { message: '❌ Speechiness deve ser número' })
  @Min(0, { message: '❌ Speechiness deve ser >= 0' })
  @Max(1, { message: '❌ Speechiness deve ser <= 1' })
  speechiness!: number;
}
