import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { IsMinAge } from '../../common/validators/is-min-age.validator';
import { MatchProperty } from '../../common/validators/match-property.validator';

export class CreateUserDto {
  // RN02: Todos os campos obrigatórios
  // RNF-S01: Nome max 50 chars, sem especiais numéricos
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(1, 50, { message: 'Nome deve ter entre 1 e 50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome não pode conter números ou caracteres especiais',
  })
  name!: string;

  // RN02, RN03: Email obrigatório e confirmar Email idêntico
  // RNF-S01: Email max 100 chars
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @Length(1, 100, { message: 'Email deve ter no máximo 100 caracteres' })
  email!: string;

  // RN03: Confirmação de Email deve ser idêntica
  @IsNotEmpty({ message: 'Confirmação de email é obrigatória' })
  @MatchProperty('email', { message: 'Emails não correspondem' })
  emailConfirmation!: string;

  // RN04: Senha forte: 8+ chars, 1 letra, 1 número
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(8, 128, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
  @Matches(/\d/, { message: 'Senha deve conter pelo menos um número' })
  password!: string;

  // RN05: Confirmação de Senha deve ser idêntica
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @MatchProperty('password', { message: 'Senhas não correspondem' })
  passwordConfirmation!: string;

  // RN06: Data de nascimento com validação de idade mínima (13 anos)
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @IsDateString({}, { message: 'Data de nascimento inválida (use formato ISO: YYYY-MM-DD)' })
  @IsMinAge(13, { message: 'Você deve ter pelo menos 13 anos para se cadastrar' })
  dateOfBirth!: string;

  // RN11: Gêneros favoritos (1-5, opcional no cadastro)
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+(,[a-zA-Z0-9_-]+){0,4}$/, {
    message: 'Máximo 5 gêneros separados por vírgula (sem espaços)',
  })
  favoriteGenres?: string;

  // RN12: Preferência de áudio
  @IsOptional()
  @Matches(/^(instrumental|mixed|vocal)$/i, {
    message: 'Preferência deve ser: instrumental, mixed ou vocal',
  })
  audioPreference?: 'instrumental' | 'mixed' | 'vocal';
}

