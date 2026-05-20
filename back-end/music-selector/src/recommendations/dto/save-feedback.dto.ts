import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FeedbackType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
}

export enum FeedbackObjective {
  FOCUS = 'FOCUS',
  WORKOUT = 'WORKOUT',
  RELAX = 'RELAX',
  MOOD_BOOST = 'MOOD_BOOST',
}

/**
 * RN23: DTO para registrar feedback (Like/Dislike)
 * Cada feedback é associado a um contexto (objetivo)
 */
export class SaveFeedbackDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID da música (RN23)',
    format: 'uuid',
  })
  @IsNotEmpty({ message: 'ID da música é obrigatório' })
  @IsUUID('4', { message: 'ID da música deve ser um UUID válido' })
  trackId!: string;

  @ApiProperty({
    example: 'LIKE',
    description: 'Reação do usuário (LIKE ou DISLIKE)',
    enum: FeedbackType,
  })
  @IsEnum(FeedbackType, { message: 'Reação deve ser LIKE ou DISLIKE' })
  @IsNotEmpty({ message: 'Reação é obrigatória' })
  reaction!: FeedbackType;

  @ApiProperty({
    example: 'FOCUS',
    description: 'Contexto objetivo da música (RN23)',
    enum: FeedbackObjective,
  })
  @IsEnum(FeedbackObjective, {
    message: 'Objetivo deve ser FOCUS, WORKOUT, RELAX ou MOOD_BOOST',
  })
  @IsNotEmpty({ message: 'Objetivo é obrigatório' })
  objectiveContext!: FeedbackObjective;
}
