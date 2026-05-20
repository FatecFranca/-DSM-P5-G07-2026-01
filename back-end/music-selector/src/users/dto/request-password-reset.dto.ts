import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar reset de senha (RN08)
 * Valida que o email existe antes de enviar o link
 */
export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário para enviar link de reset',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;
}
