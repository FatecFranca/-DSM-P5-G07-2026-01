import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * RN08 + Manutenção: Job que limpa tokens de reset de senha expirados
 * Executa automaticamente para evitar acúmulo no banco de dados
 *
 * Cron: '0 2 * * *' = Executa todo dia às 02:00
 * 
 * Por que 02:00? Para não conflitar com:
 * - 00:00 (DailyVibesJob)
 * - Picos de uso durante o dia
 */
@Injectable()
export class CleanupTokensJob {
  private readonly logger = new Logger(CleanupTokensJob.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Limpar tokens de reset de senha expirados
   * Executa todo dia às 02:00
   */
  @Cron('0 2 * * *') // 02:00 todos os dias
  async cleanExpiredResetTokens() {
    this.logger.log('🧹 Iniciando limpeza de tokens de reset expirados...');

    try {
      // Buscar quantos tokens expirados existem (para logging)
      const expiredTokens = await this.prisma.passwordResetToken.findMany({
        where: {
          expiresAt: { lt: new Date() },
        },
        select: { id: true, email: true, expiresAt: true },
      });

      if (expiredTokens.length === 0) {
        this.logger.log('✨ Nenhum token expirado encontrado');
        return;
      }

      this.logger.debug(`📊 Encontrados ${expiredTokens.length} tokens expirados`);

      // Deletar tokens expirados
      const result = await this.prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(
        `✅ Limpeza concluída: ${result.count} tokens expirados removidos`,
      );

      // Logging detalhado para auditoria (em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        const emailsDeleted = expiredTokens
          .map((t) => t.email)
          .filter((v, i, a) => a.indexOf(v) === i); // unique
        this.logger.debug(
          `📧 Emails afetados: ${emailsDeleted.join(', ')}`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        '❌ Erro crítico na limpeza de tokens expirados:',
        error,
      );
      // Não lançar erro para não interromper a aplicação
    }
  }

  /**
   * Limpar tokens já utilizados (mais de 7 dias)
   * Opcional: remover tokens que já foram usados para arquivamento
   */
  @Cron('0 3 * * 0') // 03:00 todo domingo (manutenção mais profunda)
  async cleanOldUsedTokens() {
    this.logger.log('🗑️ Limpeza profunda de tokens antigos...');

    try {
      // Manter apenas tokens usados dos últimos 7 dias (auditoria)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const result = await this.prisma.passwordResetToken.deleteMany({
        where: {
          usedAt: { lt: sevenDaysAgo },
        },
      });

      this.logger.log(
        `✅ Limpeza profunda concluída: ${result.count} tokens antigos removidos`,
      );
    } catch (error: any) {
      this.logger.error('❌ Erro na limpeza profunda de tokens:', error);
    }
  }

  /**
   * Função manual para limpeza sob demanda (pode ser exposta via controller)
   */
  async cleanTokensManually(): Promise<{ deleted: number }> {
    try {
      const result = await this.prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(
        `✅ Limpeza manual: ${result.count} tokens expirados removidos`,
      );

      return { deleted: result.count };
    } catch (error: any) {
      this.logger.error('❌ Erro na limpeza manual:', error);
      throw error;
    }
  }
}
