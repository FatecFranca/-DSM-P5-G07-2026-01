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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { SaveFeedbackDto } from './dto/save-feedback.dto';

@Controller('api/recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  private readonly logger = new Logger(RecommendationsController.name);

  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * POST /api/recommendations/generate
   * RN17-RN22: Gerar recomendações sob demanda
   */
  @Post('generate')
  async getRecommendations(
    @Request() req,
    @Body() dto: GetRecommendationsDto,
  ) {
    this.logger.log(
      `Gerando recomendações para usuário ${req.user.id} com objetivo: ${dto.objective}`,
    );
    return this.recommendationsService.getRecommendations(req.user.id, dto);
  }

  /**
   * GET /api/recommendations/daily-vibe
   * RN10, RN14-RN15: Gerar Vibe Diária automática
   */
  @Get('daily-vibe')
  async getDailyVibe(@Request() req) {
    this.logger.log(`Gerando vibe diária para usuário ${req.user.id}`);
    return this.recommendationsService.generateDailyVibe(req.user.id);
  }

  /**
   * GET /api/recommendations/vibes
   * RN14-RN15: Recuperar Vibes Diárias (playlists automáticas)
   */
  @Get('vibes')
  async getUserDailyVibes(@Request() req) {
    this.logger.log(`Recuperando vibes diárias do usuário ${req.user.id}`);
    return this.recommendationsService.getUserDailyVibes(req.user.id);
  }

  /**
   * GET /api/recommendations/history
   * RN14: Recuperar histórico de playlists
   */
  @Get('history')
  async getPlaylistHistory(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Recuperando histórico de playlists do usuário ${req.user.id}`);
    return this.recommendationsService.getUserPlaylistHistory(req.user.id, limit);
  }

  /**
   * GET /api/recommendations/feedback
   * Recuperar histórico de feedback do usuário
   */
  @Get('feedback')
  async getUserFeedback(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Recuperando histórico de feedback do usuário ${req.user.id}`);
    return this.recommendationsService.getUserFeedbackHistory(req.user.id, limit);
  }

  /**
   * GET /api/recommendations/feedback/stats
   * Recuperar estatísticas de feedback
   */
  @Get('feedback/stats')
  async getUserFeedbackStats(@Request() req) {
    this.logger.log(`Recuperando estatísticas de feedback do usuário ${req.user.id}`);
    return this.recommendationsService.getUserFeedbackStats(req.user.id);
  }

  /**
   * POST /api/recommendations/feedback
   * RN23-RN24: Registrar feedback (like/dislike)
   */
  @Post('feedback')
  async recordFeedback(
    @Request() req,
    @Body() dto: SaveFeedbackDto,
  ) {
    this.logger.log(
      `Registrando ${dto.reaction} do usuário ${req.user.id} para track ${dto.trackId}`,
    );
    return this.recommendationsService.recordFeedback(
      req.user.id,
      dto.trackId,
      dto.reaction,
      dto.objectiveContext,
    );
  }

  /**
   * GET /api/recommendations/:playlistId
   * Recuperar detalhes de uma playlist específica
   */
  @Get(':playlistId')
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
  async deletePlaylist(
    @Request() req,
    @Param('playlistId') playlistId: string,
  ) {
    this.logger.log(`Deletando playlist ${playlistId} do usuário ${req.user.id}`);
    return this.recommendationsService.deletePlaylist(playlistId, req.user.id);
  }
}

