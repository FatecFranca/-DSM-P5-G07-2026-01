import { IsEnum, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * RN18: Objetivo da Playlist
 * Define o contexto de uso: Foco, Treino, Relaxamento ou Mood Boost
 */
export enum ObjectiveType {
  FOCUS = 'FOCUS',        // Foco/Produtividade
  WORKOUT = 'WORKOUT',    // Treino/Exercício
  RELAX = 'RELAX',        // Relaxamento/Meditação
  MOOD_BOOST = 'MOOD_BOOST', // Levantar o ânimo
}

/**
 * RN20: Estado Emocional do Usuário
 * Afeta a seleção de características musicais (valence, energy)
 */
export enum MoodType {
  HAPPY = 'HAPPY',        // Feliz/Animado
  NEUTRAL = 'NEUTRAL',    // Neutro/Normal
  ANXIOUS = 'ANXIOUS',    // Ansioso/Estressado
  SAD = 'SAD',            // Triste/Melancólico
}

/**
 * RN19: Nível de Energia Desejado
 * Define o range de features de energia (0.0-1.0)
 * LOW: 0.0-0.33 | MEDIUM: 0.34-0.66 | HIGH: 0.67-1.0
 */
export enum EnergyLevelType {
  LOW = 'LOW',            // Energia baixa (0.0-0.33)
  MEDIUM = 'MEDIUM',      // Energia média (0.34-0.66)
  HIGH = 'HIGH',          // Energia alta (0.67-1.0)
}

/**
 * RN17-RN22: Parâmetros para gerar recomendações personalizadas
 * Entrada obrigatória para POST /api/recommendations/generate
 */
export class GetRecommendationsDto {
  @ApiProperty({
    example: 'FOCUS',
    description: 'RN18: Objetivo - Contexto de uso da playlist (Foco, Treino, Relaxamento ou Mood Boost)',
    enum: ObjectiveType,
    enumName: 'ObjectiveType',
  })
  @IsEnum(ObjectiveType, {
    message: 'Objetivo deve ser um de: FOCUS, WORKOUT, RELAX, MOOD_BOOST',
  })
  @IsNotEmpty({ message: 'Objetivo é obrigatório' })
  objective!: ObjectiveType;

  @ApiProperty({
    example: 'HAPPY',
    description: 'RN20: Humor - Estado emocional do usuário (impacta valence e energy)',
    enum: MoodType,
    enumName: 'MoodType',
  })
  @IsEnum(MoodType, {
    message: 'Humor deve ser um de: HAPPY, NEUTRAL, ANXIOUS, SAD',
  })
  @IsNotEmpty({ message: 'Humor é obrigatório' })
  mood!: MoodType;

  @ApiProperty({
    example: 'HIGH',
    description: 'RN19: Energia - Nível de energia desejado (LOW: 0.0-0.33, MEDIUM: 0.34-0.66, HIGH: 0.67-1.0)',
    enum: EnergyLevelType,
    enumName: 'EnergyLevelType',
  })
  @IsEnum(EnergyLevelType, {
    message: 'Energia deve ser um de: LOW, MEDIUM, HIGH',
  })
  @IsNotEmpty({ message: 'Nível de energia é obrigatório' })
  energyLevel!: EnergyLevelType;

  @ApiProperty({
    example: 10,
    description: 'RN22: Quantidade de faixas - FIXO em 10 para garantir consistência. Não alterar.',
    minimum: 10,
    maximum: 10,
    readOnly: true,
  })
  @IsOptional()
  @Min(10, { message: 'Deve ser exatamente 10 faixas (RN22)' })
  @Max(10, { message: 'Deve ser exatamente 10 faixas (RN22)' })
  limit?: number = 10;

  @ApiProperty({
    example: true,
    description: 'Incluir explicações detalhadas para cada faixa (DNA + motivo)',
    required: false,
  })
  @IsOptional()
  includeExplanation?: boolean = true;
}
