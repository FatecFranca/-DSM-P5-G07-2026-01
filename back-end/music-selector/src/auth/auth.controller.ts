import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * RN07, RNF-S04: Login com proteção contra Brute Force
   * Rate limit: 5 tentativas por minuto
   */
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Login de usuário',
    description: 'Autentica um usuário com email e senha. Retorna JWT token para requisições autenticadas. Rate limit: 5 tentativas por minuto',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      example: { message: 'Email ou senha inválidos' },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Muitas tentativas de login (rate limit)',
  })
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.signIn(credentials.email, credentials.password);
  }
}
