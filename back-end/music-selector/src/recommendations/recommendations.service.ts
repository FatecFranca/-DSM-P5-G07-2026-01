import { Injectable, Logger } from '@nestjs/common';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { PlaylistGeneratorService } from './services/playlist-generator.service';
import { PlaylistService } from './services/playlist.service';


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
   * Deletar playlist
   */
  async deletePlaylist(playlistId: string, userId: string) {
    return this.playlistService.deletePlaylist(playlistId, userId);
  }

 
}