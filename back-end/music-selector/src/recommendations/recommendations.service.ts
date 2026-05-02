import { Injectable, Logger } from '@nestjs/common';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { PlaylistGeneratorService } from './services/playlist-generator.service';
import { PlaylistService } from './services/playlist.service';
import { FeedbackService } from './services/feedback.service';

/**
 * RecommendationsService: Orquestrador principal
 * Coordena chamadas entre os serviços especializados
 */
@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    private playlistGeneratorService: PlaylistGeneratorService,
    private playlistService: PlaylistService,
    private feedbackService: FeedbackService,
  ) {}

  /**
   * RN17-RN22: Gerar recomendações sob demanda
   */
  async getRecommendations(userId: string, dto: GetRecommendationsDto) {
    return this.playlistGeneratorService.generateRecommendations(userId, dto);
  }

  /**
   * RN10, RN14-RN15: Gerar Vibe Diária
   */
  async generateDailyVibe(userId: string) {
    return this.playlistGeneratorService.generateDailyVibe(userId);
  }

  /**
   * RN14: Recuperar histórico de playlists
   */
  async getUserPlaylistHistory(userId: string, limit: number = 10) {
    return this.playlistService.getUserPlaylistHistory(userId, limit);
  }

  /**
   * RN14-RN15: Recuperar Vibes Diárias (automáticas)
   */
  async getUserDailyVibes(userId: string) {
    return this.playlistService.getUserDailyVibes(userId);
  }

  /**
   * Recuperar detalhes de uma playlist
   */
  async getPlaylistDetails(playlistId: string, userId: string) {
    return this.playlistService.getPlaylistDetails(playlistId, userId);
  }

  /**
   * RN23-RN24: Registrar feedback
   */
  async recordFeedback(
    userId: string,
    trackId: string,
    reaction: 'LIKE' | 'DISLIKE',
    objectiveContext: string,
  ) {
    return this.feedbackService.recordFeedback(
      userId,
      trackId,
      reaction,
      objectiveContext,
    );
  }

  /**
   * Recuperar histórico de feedback do usuário
   */
  async getUserFeedbackHistory(userId: string, limit: number = 50) {
    return this.feedbackService.getUserFeedbackHistory(userId, limit);
  }

  /**
   * Recuperar estatísticas de feedback
   */
  async getUserFeedbackStats(userId: string) {
    return this.feedbackService.getUserFeedbackStats(userId);
  }

  /**
   * Deletar playlist
   */
  async deletePlaylist(playlistId: string, userId: string) {
    return this.playlistService.deletePlaylist(playlistId, userId);
  }

  /**
   * Limpar feedbacks ao deletar conta
   */
  async clearUserFeedback(userId: string) {
    return this.feedbackService.clearUserFeedback(userId);
  }
}
