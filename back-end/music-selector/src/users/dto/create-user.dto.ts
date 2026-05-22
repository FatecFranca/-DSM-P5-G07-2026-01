import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMinAge } from '../../common/validators/is-min-age.validator';
import { MatchProperty } from '../../common/validators/match-property.validator';

/**
 * RN01-RN06: DTO de Registro de Usuário
 * Validações obrigatórias:
 * - RN02: Email único
 * - RN03: Senha 8+ chars (letra + número)
 * - RN05: Idade mínima 13 anos
 * - RNF-S01: Sanitização (50 chars max, sem números)
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'RNF-S01: Nome (50 chars max, sem números ou especiais)',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: '❌ Nome é obrigatório' })
  @IsString({ message: '❌ Nome deve ser texto' })
  @Length(1, 50, { message: '❌ Nome deve ter 1-50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: '❌ Nome: apenas letras e espaços permitidos',
  })
  name!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'RN02: Email único (100 chars max). RNF-S01: Regex validation',
    format: 'email',
    maxLength: 100,
  })
  @IsNotEmpty({ message: '❌ Email é obrigatório' })
  @IsEmail({}, { message: '❌ Email inválido (deve ser válido)' })
  @Length(1, 100, { message: '❌ Email máximo 100 caracteres' })
  email!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'RN01: Confirmação de email (deve ser idêntico)',
    format: 'email',
  })
  @IsNotEmpty({ message: '❌ Confirmação de email é obrigatória' })
  @MatchProperty('email', { message: '❌ Emails não correspondem' })
  emailConfirmation!: string;

  @ApiProperty({
    example: 'SenhaForte123',
    description: 'Senha segura (8+ chars, mínimo 1 letra e 1 número)',
    minLength: 8,
    pattern: '^(?=.*[a-zA-Z])(?=.*\\d)',
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(8, 128, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
  @Matches(/\d/, { message: 'Senha deve conter pelo menos um número' })
  password!: string;

  @ApiProperty({
    example: 'SenhaForte123',
    description: 'Confirmação da senha (deve corresponder a password)',
  })
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @MatchProperty('password', { message: 'Senhas não correspondem' })
  passwordConfirmation!: string;

  @ApiProperty({
    example: '2005-06-15',
    description: 'Data de nascimento (ISO format: YYYY-MM-DD). Mínimo 13 anos.',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @IsDateString({}, { message: 'Data de nascimento inválida (use formato ISO: YYYY-MM-DD)' })
  @IsMinAge(13, { message: 'Você deve ter pelo menos 13 anos para se cadastrar' })
  dateOfBirth!: string;

  @ApiProperty({
    example: 'pop,rock,jazz',
    description: 'Gêneros favoritos (1-5, separados por vírgula, sem espaços) - OPCIONAL',
    required: false,
  })
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+(,[a-zA-Z0-9_-]+){0,4}$/, {
    message: 'Máximo 5 gêneros separados por vírgula (sem espaços)',
  })
  favoriteGenres?: string;

  @ApiProperty({
    example: 'mixed',
    description: 'Preferência de áudio (instrumental, mixed ou vocal) - OPCIONAL',
    enum: ['instrumental', 'mixed', 'vocal'],
    required: false,
  })
  @IsOptional()
  @Matches(/^(instrumental|mixed|vocal)$/i, {
    message: 'Preferência deve ser: instrumental, mixed ou vocal',
  })
  audioPreference?: 'instrumental' | 'mixed' | 'vocal';
}

