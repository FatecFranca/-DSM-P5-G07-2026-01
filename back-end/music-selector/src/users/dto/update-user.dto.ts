import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchProperty } from '../../common/validators/match-property.validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Joao Silva',
    description: 'Nome do usuario',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @Length(1, 50, { message: 'Nome deve ter entre 1 e 50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome nao pode conter numeros ou caracteres especiais',
  })
  name?: string;

  @ApiProperty({
    example: 'NovaSenha456',
    description: 'Nova senha',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(8, 128, { message: 'Senha deve ter no minimo 8 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
  @Matches(/\d/, { message: 'Senha deve conter pelo menos um numero' })
  password?: string;

  @ApiProperty({
    example: 'NovaSenha456',
    description: 'Confirmacao da nova senha',
    required: false,
  })
  @IsOptional()
  @ValidateIf((dto) => dto.password !== undefined)
  @IsNotEmpty({ message: 'Confirmacao de senha e obrigatoria' })
  @MatchProperty('password', { message: 'Senhas nao correspondem' })
  passwordConfirmation?: string;
}
