import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMinAge } from '../../common/validators/is-min-age.validator';
import { MatchProperty } from '../../common/validators/match-property.validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Joao Silva',
    description: 'Nome do usuario',
    minLength: 1,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
  @IsString({ message: 'Nome deve ser texto' })
  @Length(1, 50, { message: 'Nome deve ter 1-50 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome: apenas letras e espacos permitidos',
  })
  name!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email unico',
    format: 'email',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  @IsEmail({}, { message: 'Email invalido' })
  @Length(1, 100, { message: 'Email maximo 100 caracteres' })
  email!: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Confirmacao de email',
    format: 'email',
  })
  @IsNotEmpty({ message: 'Confirmacao de email e obrigatoria' })
  @MatchProperty('email', { message: 'Emails nao correspondem' })
  emailConfirmation!: string;

  @ApiProperty({
    example: 'SenhaForte123',
    description: 'Senha segura com minimo 8 caracteres, uma letra e um numero',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Senha e obrigatoria' })
  @IsString({ message: 'Senha deve ser uma string' })
  @Length(8, 128, { message: 'Senha deve ter no minimo 8 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
  @Matches(/\d/, { message: 'Senha deve conter pelo menos um numero' })
  password!: string;

  @ApiProperty({
    example: 'SenhaForte123',
    description: 'Confirmacao da senha',
  })
  @IsNotEmpty({ message: 'Confirmacao de senha e obrigatoria' })
  @MatchProperty('password', { message: 'Senhas nao correspondem' })
  passwordConfirmation!: string;

  @ApiProperty({
    example: '2005-06-15',
    description: 'Data de nascimento em formato YYYY-MM-DD',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Data de nascimento e obrigatoria' })
  @IsDateString({}, { message: 'Data de nascimento invalida' })
  @IsMinAge(13, { message: 'Voce deve ter pelo menos 13 anos para se cadastrar' })
  dateOfBirth!: string;
}
