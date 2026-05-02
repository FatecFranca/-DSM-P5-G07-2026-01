import {
  IsString,
  IsOptional,
  Length,
  Matches,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { MatchProperty } from '../../common/validators/match-property.validator';

export class UpdateUserDto {
  // RN26: Nome editável
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(1, 50, { message: 'Nome deve ter entre 1 e 50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome não pode conter números ou caracteres especiais',
  })
  name?: string;

  // RN26: Senha editável com validação de força
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(8, 128, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
  @Matches(/\d/, { message: 'Senha deve conter pelo menos um número' })
  password?: string;

  // RN26: Confirmação de Senha
  @IsOptional()
  @ValidateIf((dto) => dto.password !== undefined)
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @MatchProperty('password', { message: 'Senhas não correspondem' })
  passwordConfirmation?: string;

  // RN27: Gêneros editáveis
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+(,[a-zA-Z0-9_-]+){0,4}$/, {
    message: 'Máximo 5 gêneros separados por vírgula (sem espaços)',
  })
  favoriteGenres?: string;

  // RN27: Preferência de áudio editável
  @IsOptional()
  @Matches(/^(instrumental|mixed|vocal)$/i, {
    message: 'Preferência deve ser: instrumental, mixed ou vocal',
  })
  audioPreference?: 'instrumental' | 'mixed' | 'vocal';

  // RN26: Email e dateOfBirth são IMUTÁVEIS - não incluir no DTO
  // Se tentar enviar, serão ignorados pelo whitelist do ValidationPipe
}

