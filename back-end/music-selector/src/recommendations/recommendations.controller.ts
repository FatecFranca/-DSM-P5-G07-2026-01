import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
  Query,
  Logger,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';


@Controller('api/recommendations')
@UseGuards(JwtAuthGuard)
@ApiTags('Recommendations')
@ApiBearerAuth()
export class RecommendationsController {
  private readonly logger = new Logger(RecommendationsController.name);

  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * POST /api/recommendations/generate
   * RN17-RN22: Gerar recomendações sob demanda ("Criar Minha Vibe")
   * 
   * Parâmetros obrigatórios:
   * - objective: FOCUS | WORKOUT | RELAX | MOOD_BOOST
   * - mood: HAPPY | NEUTRAL | ANXIOUS | SAD
   * - energyLevel: LOW | MEDIUM | HIGH
   * 
   * Retorna exatamente 10 faixas ordenadas por (relevância 70% + popularity 30%)
   */
  @Post('generate')
  @ApiOperation({
    summary: 'Gerar recomendações personalizadas ("Criar Minha Vibe")',
    description: 'RN17-RN22: Cria playlist customizada com 3 parâmetros recebidos do FastAPI (Preferência de Áudio + Energia + Humor). Retorna EXATAMENTE 10 faixas com DNA musical (Energy, Valence, Danceability + features técnicas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendações geradas com sucesso - 10 faixas',
    schema: {
      example: {
        playlistId: 'uuid',
        playlistName: 'Instrumental Happy Vibe',
        audioPreference: 'INSTRUMENTAL', // ◄ ATUALIZADO: Substituído objective por audioPreference
        mood: 'HAPPY',
        energyLevel: 'HIGH',
        generatedAt: '2026-06-04T11:30:00Z',
        tracks: [
          {
            id: 'track-1',
            title: 'Song Name',
            artist: 'Artist Name',
            album: 'Album Name',
            genre: 'Electronic',
            popularity: 75,
            features: { 
              energy: 0.75, 
              valence: 0.65, 
              danceability: 0.7, 
              acousticness: 0.1, 
              instrumentalness: 0.85, 
              speechiness: 0.03, 
              tempo: 120 
            },
            explanation: 'Instrumental conforme preferência, energia alta conforme solicitado',
            reason: 'Sugerida por ter valência alta (motivante) e alta taxa instrumental',
          },
        ],
        totalTracks: 10,
        mlModelScore: 0.89,
        explanation: 'Playlist "Instrumental Happy Vibe" gerada com base em suas preferências',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos ou dados do FastAPI ausentes' })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  @ApiResponse({ status: 422, description: 'Preferência de Áudio/Energia/Humor inválidos' })
  
  
  
  // ◄ ATUALIZADO
  async getRecommendations(
    @Request() req,
    @Body() dto: GetRecommendationsDto,
  ) {
    this.logger.log(
      `🎵 Gerando recomendações para usuário ${req.user.id}: Preferencia de Audio=${dto.audioPreference}, Energia=${dto.energyLevel}, Humor=${dto.mood}`,
    );
    
    // Validar que exatamente 10 faixas são solicitadas (RN22)
    if (dto.limit !== 10 && dto.limit !== undefined) {
      this.logger.warn(`⚠️ Tentativa de gerar ${dto.limit} faixas, forçando para 10 (RN22)`);
      dto.limit = 10;
    }
    
    return this.recommendationsService.getRecommendations(req.user.id, dto);
  }

  /**
   * GET /api/recommendations/daily-vibe
   * RN10, RN14-RN15: Gerar Vibe Diária automática
   */
  @Get('daily-vibe')
  @ApiOperation({
    summary: 'Gerar Vibe Diária',
    description: 'RN10, RN14-RN15: Recomendação automática recalculada a cada 24h baseada no perfil do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Vibe diária gerada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getDailyVibe(@Request() req) {
    this.logger.log(`Gerando vibe diária para usuário ${req.user.id}`);
    return this.recommendationsService.generateDailyVibe(req.user.id);
  }

  /**
   * GET /api/recommendations/vibes
   * RN14-RN15: Recuperar Vibes Diárias (playlists automáticas)
   */
  @Get('vibes')
  @ApiOperation({
    summary: 'Listar Vibes Diárias',
    description: 'RN14-RN15: Retorna histórico de vibes diárias do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de vibes diárias',
    isArray: true,
  })
  async getUserDailyVibes(@Request() req) {
    this.logger.log(`Recuperando vibes diárias do usuário ${req.user.id}`);
    return this.recommendationsService.getUserDailyVibes(req.user.id);
  }

  /**
   * GET /api/recommendations/history
   * RN14: Recuperar histórico de playlists
   */
  @Get('history')
  @ApiOperation({
    summary: 'Histórico de playlists',
    description: 'RN14: Retorna lista paginada de playlists criadas pelo usuário',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados (padrão: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de playlists',
    isArray: true,
  })
  async getPlaylistHistory(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Recuperando histórico de playlists do usuário ${req.user.id}`);
    return this.recommendationsService.getUserPlaylistHistory(req.user.id, limit);
  }

 
  @Get(':playlistId')
  @ApiParam({
    name: 'playlistId',
    description: 'ID da playlist',
  })
  @ApiOperation({
    summary: 'Detalhes da playlist',
    description: 'Retorna informações completas de uma playlist incluindo todas as faixas',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da playlist',
  })
  @ApiResponse({ status: 404, description: 'Playlist não encontrada' })
  async getPlaylistDetails(
    @Request() req,
    @Param('playlistId') playlistId: string,
  ) {
    this.logger.log(`Recuperando detalhes da playlist ${playlistId}`);
    return this.recommendationsService.getPlaylistDetails(playlistId, req.user.id);
  }

  /**
   * DELETE /api/recommendations/:playlistId
   * Deletar uma playlist específica
   */
  @Delete(':playlistId')
  @ApiParam({
    name: 'playlistId',
    description: 'ID da playlist',
  })
  @ApiOperation({
    summary: 'Deletar playlist',
    description: 'Remove uma playlist criada pelo usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Playlist deletada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Playlist não encontrada' })
  @ApiResponse({ status: 403, description: 'Não autorizado a deletar esta playlist' })
  async deletePlaylist(
    @Request() req,
    @Param('playlistId') playlistId: string,
  ) {
    this.logger.log(`Deletando playlist ${playlistId} do usuário ${req.user.id}`);
    return this.recommendationsService.deletePlaylist(playlistId, req.user.id);
  }
}

