import { IsEnum, IsNotEmpty, IsOptional, Min, Max } from 'class-validator';

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
  @IsEnum(ObjectiveType)
  @IsNotEmpty()
  objective!: ObjectiveType;

  @IsEnum(MoodType)
  @IsNotEmpty()
  mood!: MoodType;

  @IsEnum(EnergyLevelType)
  @IsNotEmpty()
  energyLevel!: EnergyLevelType;

  @IsOptional()
  @Min(10)
  @Max(10)
  limit?: number = 10; // RN22: Sempre 10 faixas

  @IsOptional()
  includeExplanation?: boolean = true;
}
