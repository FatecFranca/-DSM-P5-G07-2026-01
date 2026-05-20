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

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo (máx 50 chars, sem números ou especiais)',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(1, 50, { message: 'Nome deve ter entre 1 e 50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome não pode conter números ou caracteres especiais',
  })
  name!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email único do usuário',
    format: 'email',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @Length(1, 100, { message: 'Email deve ter no máximo 100 caracteres' })
  email!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Confirmação do email (deve ser idêntico ao email)',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Confirmação de email é obrigatória' })
  @MatchProperty('email', { message: 'Emails não correspondem' })
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

