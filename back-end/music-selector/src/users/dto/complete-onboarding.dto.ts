import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteOnboardingDto {
  @ApiProperty({
    example: ['pop', 'rock', 'indie'],
    description: 'Lista de 1-5 gêneros musicais favoritos',
    type: [String],
    minItems: 1,
    maxItems: 5,
  })
  @IsArray({ message: 'Gêneros devem ser uma lista' })
  @ArrayMinSize(1, { message: 'Selecione pelo menos 1 gênero' })
  @ArrayMaxSize(5, { message: 'Selecione no máximo 5 gêneros' })
  @IsString({ each: true, message: 'Gênero deve ser uma string' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    each: true,
    message: 'Gênero inválido',
  })
  favoriteGenres!: string[];

  @ApiProperty({
    example: 'mixed',
    description: 'Preferência de áudio (instrumental, mixed ou vocal)',
    enum: ['instrumental', 'mixed', 'vocal'],
  })
  @IsNotEmpty({ message: 'Preferência de áudio é obrigatória' })
  @Matches(/^(instrumental|mixed|vocal)$/i, {
    message: 'Preferência deve ser: instrumental, mixed ou vocal',
  })
  audioPreference!: string;
}
