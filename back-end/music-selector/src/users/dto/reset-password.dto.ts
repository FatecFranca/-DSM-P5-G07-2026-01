import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchProperty } from '../../common/validators/match-property.validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de 6 dígitos enviado no email para reset de senha',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @IsString({ message: 'Código deve ser uma string' })
  @Length(6, 6, { message: 'Código deve ter 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'Código deve conter apenas números' })
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
