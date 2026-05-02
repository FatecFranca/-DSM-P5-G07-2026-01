import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * RN07, RNF-S04: Login com proteção contra Brute Force
   * Rate limit: 5 tentativas por minuto
   */
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.signIn(credentials.email, credentials.password);
  }
}
