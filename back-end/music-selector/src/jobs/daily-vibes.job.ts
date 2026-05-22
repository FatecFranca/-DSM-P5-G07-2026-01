import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PlaylistGeneratorService } from '../recommendations/services/playlist-generator.service';

/**
 * RN15: Job que recalcula Vibes Diárias a cada 24 horas
 * RN28: Também é chamado quando usuário atualiza preferências
 *
 * Cron: '0 0 * * *' = Executa todo dia às 00:00
 */
@Injectable()
export class DailyVibesJob {
  private readonly logger = new Logger(DailyVibesJob.name);

  constructor(
    private prisma: PrismaService,
    private playlistGenerator: PlaylistGeneratorService,
  ) {}

  /**
   * RN15: Recalcular todas as Vibes Diárias automaticamente
   * Executa todo dia à meia-noite (00:00)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async recalculateDailyVibes() {
    this.logger.log('🎵 Iniciando recálculo de Vibes Diárias...');

    try {
      // Buscar todos os usuários que completaram onboarding
      const users = await this.prisma.user.findMany({
        where: { onboardingDone: true },
        select: { id: true, name: true },
      });

      this.logger.log(`📊 ${users.length} usuários encontrados para recálculo`);

      let successCount = 0;
      let errorCount = 0;

      // Recalcular vibes para cada usuário
      for (const user of users) {
        try {
          await this.playlistGenerator.generateDailyVibe(user.id);
          successCount++;
          this.logger.debug(`✅ Vibes recalculadas para ${user.name}`);
        } catch (error: any) {
          errorCount++;
          this.logger.warn(
            `⚠️ Erro ao recalcular vibes para ${user.name}: ${error?.message}`,
          );
        }
      }

      this.logger.log(
        `✨ Recálculo concluído: ${successCount} sucesso, ${errorCount} erros`,
      );
    } catch (error: any) {
      this.logger.error('❌ Erro crítico no job de Vibes Diárias:', error);
    }
  }

  /**
   * RN28: Recalcular vibes para um usuário específico
   * Chamado quando o usuário atualiza suas preferências
   *
   * @param userId ID do usuário
   */
  async triggerVibeRecalculation(userId: string): Promise<void> {
    this.logger.log(`🔄 Acionando recálculo de vibes para usuário: ${userId}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, onboardingDone: true },
      });

      if (!user) {
        this.logger.warn(`Usuário ${userId} não encontrado`);
        return;
      }

      if (!user.onboardingDone) {
        this.logger.warn(`Usuário ${user.name} ainda não completou onboarding`);
        return;
      }

      await this.playlistGenerator.generateDailyVibe(userId);
      this.logger.log(`✅ Vibes recalculadas para ${user.name}`);
    } catch (error: any) {
      this.logger.error(
        `❌ Erro ao recalcular vibes para ${userId}:`,
        error?.message,
      );
    }
  }

  /**
   * Job adicional: Limpar tokens de reset expirados (opcional)
   * Executa todo dia às 02:00
   */
  @Cron('0 2 * * *')
  async cleanExpiredTokens() {
    this.logger.log('🧹 Iniciando limpeza de tokens expirados...');

    try {
      const result = await this.prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      this.logger.log(
        `✅ ${result.count} tokens expirados removidos do banco`,
      );
    } catch (error: any) {
      this.logger.error(
        '❌ Erro ao limpar tokens expirados:',
        error?.message,
      );
    }
  }
}
