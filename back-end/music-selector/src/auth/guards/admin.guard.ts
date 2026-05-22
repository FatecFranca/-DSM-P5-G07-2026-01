import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Guard para validar se o usuário tem role de ADMIN
 * Deve ser usado em conjunto com JwtAuthGuard
 *
 * Uso:
 * @UseGuards(JwtAuthGuard, AdminGuard)
 * @Get()
 * async findAll() { ... }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Validar se o usuário está autenticado (JwtAuthGuard já faz isso)
    if (!user) {
      throw new ForbiddenException('Acesso negado: usuário não autenticado');
    }

    // Validar se o usuário tem role de admin
    // Nota: role pode vir do JWT payload ou do banco de dados
    const isAdmin = user.role === 'ADMIN' || user.isAdmin === true;

    if (!isAdmin) {
      throw new ForbiddenException('Acesso negado: permissão de administrador necessária');
    }

    return true;
  }
}
