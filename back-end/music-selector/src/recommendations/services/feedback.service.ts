import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MLService } from './ml.service';

/**
 * FeedbackService: Registrar e gerenciar feedback de usuários
 * RN23-RN24: Armazenar like/dislike e bloquear tracks desaprovadas
 */
@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private prisma: PrismaService,
    private mlService: MLService,
  ) {}

  /**
   * RN23: Registrar feedback (like/dislike) de uma track
   */
  async recordFeedback(
    userId: string,
    trackId: string,
    reaction: 'LIKE' | 'DISLIKE',
    objectiveContext: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const track = await this.prisma.track.findUnique({ where: { id: trackId } });

      if (!user || !track) {
        throw new BadRequestException('Usuário ou track não encontrado');
      }

      // Verificar se já existe feedback desta track neste contexto
      const existingFeedback = await this.prisma.feedback.findFirst({
        where: {
          userId,
          trackId,
          objectiveContext: objectiveContext as any,
        },
      });

      // Atualizar se já existe, criar se novo
      let feedback;
      if (existingFeedback) {
        feedback = await this.prisma.feedback.update({
          where: { id: existingFeedback.id },
          data: { reaction },
          include: { track: true },
        });
        this.logger.log(
          `Feedback atualizado para ${reaction} - ${userId} / ${trackId}`,
        );
      } else {
        feedback = await this.prisma.feedback.create({
          data: {
            userId,
            trackId,
            reaction,
            objectiveContext: objectiveContext as any,
          },
          include: { track: true },
        });
        this.logger.log(
          `Feedback criado como ${reaction} - ${userId} / ${trackId}`,
        );
      }

      // Enviar feedback para ML service para retreinamento (async, não bloqueia)
      this.mlService.submitFeedback({
        userId,
        trackId,
        reaction,
        objectiveContext,
        trackFeatures: {
          energy: track.energy,
          valence: track.valence,
          danceability: track.danceability,
          acousticness: track.acousticness,
          instrumentalness: track.instrumentalness,
          tempo: track.tempo,
        },
      }).catch((err) => {
        this.logger.warn(`Erro ao enviar feedback ao ML: ${err?.message}`);
      });

      return {
        success: true,
        message: `Feedback registrado como ${reaction}`,
        feedback,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao registrar feedback: ${error?.message}`);
      throw error;
    }
  }

  /**
   * RN24: Recuperar dislikes de um usuário em um contexto
   * Usado para filtrar playlists recomendadas
   */
  async getUserDislikes(userId: string, objectiveContext: string) {
    try {
      const dislikes = await this.prisma.feedback.findMany({
        where: {
          userId,
          reaction: 'DISLIKE',
          objectiveContext: objectiveContext as any,
        },
        select: { trackId: true },
      });

      return dislikes.map((d) => d.trackId);
    } catch (error: any) {
      this.logger.error(`Erro ao recuperar dislikes: ${error?.message}`);
      return [];
    }
  }

  /**
   * Recuperar histórico de feedback do usuário
   */
  async getUserFeedbackHistory(userId: string, limit: number = 50) {
    try {
      const feedbacks = await this.prisma.feedback.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { track: true },
      });

      this.logger.log(`Histórico de feedback recuperado: ${feedbacks.length} para ${userId}`);
      return feedbacks;
    } catch (error: any) {
      this.logger.error(`Erro ao recuperar histórico de feedback: ${error?.message}`);
      throw error;
    }
  }

  /**
   * Recuperar estatísticas de feedback do usuário
   */
  async getUserFeedbackStats(userId: string) {
    try {
      const stats = await this.prisma.feedback.groupBy({
        by: ['reaction', 'objectiveContext'],
        where: { userId },
        _count: true,
      });

      return stats;
    } catch (error: any) {
      this.logger.error(`Erro ao recuperar estatísticas: ${error?.message}`);
      throw error;
    }
  }

  /**
   * Limpar todos os feedbacks de um usuário (ao deletar conta)
   */
  async clearUserFeedback(userId: string) {
    try {
      const result = await this.prisma.feedback.deleteMany({
        where: { userId },
      });

      this.logger.log(`Feedbacks deletados para usuário ${userId}: ${result.count}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Erro ao limpar feedbacks: ${error?.message}`);
      throw error;
    }
  }
}
