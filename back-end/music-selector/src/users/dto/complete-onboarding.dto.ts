import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
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
}
