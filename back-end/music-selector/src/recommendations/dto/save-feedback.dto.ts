import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

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
  @IsNotEmpty({ message: 'ID da música é obrigatório' })
  @IsUUID('4', { message: 'ID da música deve ser um UUID válido' })
  trackId!: string;

  @IsEnum(FeedbackType, { message: 'Reação deve ser LIKE ou DISLIKE' })
  @IsNotEmpty({ message: 'Reação é obrigatória' })
  reaction!: FeedbackType;

  @IsEnum(FeedbackObjective, {
    message: 'Objetivo deve ser FOCUS, WORKOUT, RELAX ou MOOD_BOOST',
  })
  @IsNotEmpty({ message: 'Objetivo é obrigatório' })
  objectiveContext!: FeedbackObjective;
}
