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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';

type AuthenticatedRequest = {
  user: {
    id: string;
  };
};

@Controller('api/recommendations')
@UseGuards(JwtAuthGuard)
@ApiTags('Recommendations')
@ApiBearerAuth()
export class RecommendationsController {
  private readonly logger = new Logger(RecommendationsController.name);

  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Gerar recomendacoes personalizadas',
    description:
      'Recebe objective, mood e energyLevel, converte para as 7 features do ML, chama POST /predict-vibe e retorna 10 musicas da vibe prevista.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendacoes geradas com sucesso - 10 faixas',
    schema: {
      example: {
        playlistId: 'uuid',
        playlistName: 'Workout HAPPY Vibe',
        objective: 'WORKOUT',
        mood: 'HAPPY',
        energyLevel: 'HIGH',
        predictedVibe: 'WORKOUT',
        generatedAt: '2026-06-04T11:30:00Z',
        tracks: [
          {
            id: 'track-1',
            title: 'Song Name',
            artist: 'Artist Name',
            album: 'Album Name',
            popularity: 75,
            features: {
              danceability: 0.7,
              energy: 0.75,
              valence: 0.65,
              acousticness: 0.1,
              instrumentalness: 0.05,
              speechiness: 0.08,
              tempo: 120,
            },
          },
        ],
        totalTracks: 10,
        mlModelScore: 0.89,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Parametros invalidos ou tracks insuficientes',
  })
  @ApiResponse({ status: 401, description: 'Token invalido ou expirado' })
  @ApiResponse({
    status: 422,
    description: 'Objective, mood ou energyLevel invalidos',
  })
  async getRecommendations(
    @Request() req: AuthenticatedRequest,
    @Body() dto: GetRecommendationsDto,
  ) {
    this.logger.log(
      `Gerando recomendacoes para usuario ${req.user.id}: objective=${dto.objective}, energyLevel=${dto.energyLevel}, mood=${dto.mood}`,
    );

    return this.recommendationsService.getRecommendations(req.user.id, dto);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Historico de playlists',
    description: 'Retorna lista paginada de playlists criadas pelo usuario',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de resultados do historico, padrao 10',
  })
  @ApiResponse({
    status: 200,
    description: 'Historico de playlists',
    isArray: true,
  })
  async getPlaylistHistory(
    @Request() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(
      `Recuperando historico de playlists do usuario ${req.user.id}`,
    );
    return this.recommendationsService.getUserPlaylistHistory(
      req.user.id,
      limit,
    );
  }

  @Get(':playlistId')
  @ApiParam({ name: 'playlistId', description: 'ID da playlist' })
  @ApiOperation({
    summary: 'Detalhes da playlist',
    description:
      'Retorna informacoes completas de uma playlist incluindo todas as faixas',
  })
  @ApiResponse({ status: 200, description: 'Detalhes da playlist' })
  @ApiResponse({ status: 404, description: 'Playlist nao encontrada' })
  async getPlaylistDetails(
    @Request() req: AuthenticatedRequest,
    @Param('playlistId') playlistId: string,
  ) {
    this.logger.log(`Recuperando detalhes da playlist ${playlistId}`);
    return this.recommendationsService.getPlaylistDetails(
      playlistId,
      req.user.id,
    );
  }

  @Delete(':playlistId')
  @ApiParam({ name: 'playlistId', description: 'ID da playlist' })
  @ApiOperation({
    summary: 'Deletar playlist',
    description: 'Remove uma playlist criada pelo usuario',
  })
  @ApiResponse({ status: 200, description: 'Playlist deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Playlist nao encontrada' })
  @ApiResponse({
    status: 403,
    description: 'Nao autorizado a deletar esta playlist',
  })
  async deletePlaylist(
    @Request() req: AuthenticatedRequest,
    @Param('playlistId') playlistId: string,
  ) {
    this.logger.log(
      `Deletando playlist ${playlistId} do usuario ${req.user.id}`,
    );
    return this.recommendationsService.deletePlaylist(playlistId, req.user.id);
  }
}
