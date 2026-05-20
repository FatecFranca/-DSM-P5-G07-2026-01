import { IsEnum, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ObjectiveType {
  FOCUS = 'FOCUS',
  WORKOUT = 'WORKOUT',
  RELAX = 'RELAX',
  MOOD_BOOST = 'MOOD_BOOST',
}

export enum MoodType {
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  ANXIOUS = 'ANXIOUS',
  SAD = 'SAD',
}

export enum EnergyLevelType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export class GetRecommendationsDto {
  @ApiProperty({
    example: 'FOCUS',
    description: 'Objetivo da playlist (RN18)',
    enum: ObjectiveType,
  })
  @IsEnum(ObjectiveType)
  @IsNotEmpty()
  objective!: ObjectiveType;

  @ApiProperty({
    example: 'HAPPY',
    description: 'Estado emocional atual (RN20)',
    enum: MoodType,
  })
  @IsEnum(MoodType)
  @IsNotEmpty()
  mood!: MoodType;

  @ApiProperty({
    example: 'HIGH',
    description: 'Nível de energia desejado (RN19)',
    enum: EnergyLevelType,
  })
  @IsEnum(EnergyLevelType)
  @IsNotEmpty()
  energyLevel!: EnergyLevelType;

  @ApiProperty({
    example: 10,
    description: 'Número de recomendações (RN22: sempre 10)',
    minimum: 10,
    maximum: 10,
  })
  @IsOptional()
  @Min(10)
  @Max(10)
  limit?: number = 10; // RN22: Sempre 10 faixas

  @IsOptional()
  includeExplanation?: boolean = true;
}
