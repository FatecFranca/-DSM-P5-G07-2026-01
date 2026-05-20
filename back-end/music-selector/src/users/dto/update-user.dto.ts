import {
  IsString,
  IsOptional,
  Length,
  Matches,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchProperty } from '../../common/validators/match-property.validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do usuário (máx 50 chars)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(1, 50, { message: 'Nome deve ter entre 1 e 50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome não pode conter números ou caracteres especiais',
  })
  name?: string;

  @ApiProperty({
    example: 'NovaSenha456',
    description: 'Nova senha (8+ chars, letra + número)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(8, 128, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
  @Matches(/\d/, { message: 'Senha deve conter pelo menos um número' })
  password?: string;

  @ApiProperty({
    example: 'NovaSenha456',
    description: 'Confirmação da nova senha',
    required: false,
  })
  @IsOptional()
  @ValidateIf((dto) => dto.password !== undefined)
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @MatchProperty('password', { message: 'Senhas não correspondem' })
  passwordConfirmation?: string;

  @ApiProperty({
    example: 'rock,indie,jazz',
    description: 'Gêneros favoritos (1-5, separados por vírgula)',
    required: false,
  })
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+(,[a-zA-Z0-9_-]+){0,4}$/, {
    message: 'Máximo 5 gêneros separados por vírgula (sem espaços)',
  })
  favoriteGenres?: string;

  @ApiProperty({
    example: 'vocal',
    description: 'Preferência de áudio (instrumental, mixed ou vocal)',
    enum: ['instrumental', 'mixed', 'vocal'],
    required: false,
  })
  @IsOptional()
  @Matches(/^(instrumental|mixed|vocal)$/i, {
    message: 'Preferência deve ser: instrumental, mixed ou vocal',
  })
  audioPreference?: 'instrumental' | 'mixed' | 'vocal';

  // RN26: Email e dateOfBirth são IMUTÁVEIS - não incluir no DTO
  // Se tentar enviar, serão ignorados pelo whitelist do ValidationPipe
}

