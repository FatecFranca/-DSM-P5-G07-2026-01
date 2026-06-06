import { IsEnum, IsNotEmpty } from 'class-validator';
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
    example: 'WORKOUT',
    description:
      'Objetivo que define a base da conversao para as 7 features do ML',
    enum: ObjectiveType,
    enumName: 'ObjectiveType',
  })
  @IsEnum(ObjectiveType, {
    message: 'Objective deve ser um de: FOCUS, WORKOUT, RELAX, MOOD_BOOST',
  })
  @IsNotEmpty({ message: 'Objective e obrigatorio' })
  objective!: ObjectiveType;

  @ApiProperty({
    example: 'HAPPY',
    description: 'Humor do usuario usado na conversao para features do ML',
    enum: MoodType,
    enumName: 'MoodType',
  })
  @IsEnum(MoodType, {
    message: 'Humor deve ser um de: HAPPY, NEUTRAL, ANXIOUS, SAD',
  })
  @IsNotEmpty({ message: 'Humor e obrigatorio' })
  mood!: MoodType;

  @ApiProperty({
    example: 'HIGH',
    description:
      'Nivel de energia desejado usado na conversao para features do ML',
    enum: EnergyLevelType,
    enumName: 'EnergyLevelType',
  })
  @IsEnum(EnergyLevelType, {
    message: 'Energia deve ser um de: LOW, MEDIUM, HIGH',
  })
  @IsNotEmpty({ message: 'Nivel de energia e obrigatorio' })
  energyLevel!: EnergyLevelType;
}
