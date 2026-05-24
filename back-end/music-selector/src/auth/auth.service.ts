import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * RNF-S03: Autenticação segura com BCrypt
   * Compara password com hash armazenado no banco
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: { id: string; name: string; email: string; onboardingDone: boolean } }> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // RNF-S03: Comparar password com hash usando BCrypt
    const isPasswordValid = await bcrypt.compare(password, (user as any).passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = { sub: (user as any).id, email: (user as any).email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        onboardingDone: (user as any).onboardingDone,
      },
    };
  }

  /**
   * Gerar hash seguro da senha com BCrypt
   * @param password Senha em texto puro
   * @returns Hash da senha
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Validar se password bate com hash
   * @param password Senha em texto puro
   * @param hash Hash armazenado
   * @returns true se válida
   */
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
