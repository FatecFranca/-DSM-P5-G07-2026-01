import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchProperty } from '../../common/validators/match-property.validator';

/**
 * DTO para resetar senha (RNF-S03)
 * Valida força da senha e confirmação
 */
export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456ghi789...',
    description: 'Token enviado no email para reset de senha (64 caracteres hex)',
    minLength: 64,
    maxLength: 64,
  })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString({ message: 'Token deve ser uma string' })
  token!: string;

  @ApiProperty({
    example: 'NovaSenha123',
    description: 'Nova senha (8+ chars, letra + número)',
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
    example: 'NovaSenha123',
    description: 'Confirmação da nova senha (deve corresponder a password)',
  })
  @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
  @MatchProperty('password', { message: 'Senhas não correspondem' })
  passwordConfirmation!: string;
}
