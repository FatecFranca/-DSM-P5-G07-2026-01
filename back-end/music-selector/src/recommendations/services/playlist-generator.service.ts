import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetRecommendationsDto } from '../dto/get-recommendations.dto';
import { MLService } from './ml.service';
import { PlaylistService } from './playlist.service';
import { FeedbackService } from './feedback.service';
import type { TrackModel } from '../../generated/prisma/models/Track';

/**
 * PlaylistGeneratorService: Lógica de geração de playlists
 * Responsável por: gerar recomendações sob demanda, vibes diárias, enriquecer com features
 */
@Injectable()
export class PlaylistGeneratorService {
  private readonly logger = new Logger(PlaylistGeneratorService.name);

  constructor(
    private prisma: PrismaService,
    private mlService: MLService,
    private playlistService: PlaylistService,
    private feedbackService: FeedbackService,
  ) {}

  /**
   * RN17-RN22: Gerar recomendações sob demanda
   */
  async generateRecommendations(
    userId: string,
    dto: GetRecommendationsDto,
  ) {
    try {
      const targetCount = 10;
      // Validar usuário e onboarding
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          genres: { include: { genre: true } },
          onboardingProfile: true,
          feedbacks: { include: { track: true } },
        },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      if (!user.onboardingDone) {
        throw new BadRequestException(
          'Complete o onboarding antes de gerar recomendações personalizadas',
        );
      }

      // Preparar features do usuário
      const userFeatures = this.prepareUserFeatures(user);

      // Chamar ML service
      const mlRequestLimit = Math.max(targetCount * 5, dto.limit ?? 0);
      const mlRecommendations = await this.mlService.getRecommendations({
        objective: dto.objective,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        userFeatures,
        limit: mlRequestLimit,
      });

      // RN24: Recuperar dislikes neste contexto
      const dislikedTrackIds = await this.feedbackService.getUserDislikes(
        userId,
        dto.objective,
      );

      // Recuperar dados das tracks e filtrar dislikes
      const tracks = await this.prisma.track.findMany({
        where: {
          id: { in: mlRecommendations.trackIds },
          // Excluir dislikes
          NOT: {
            id: { in: dislikedTrackIds },
          },
        },
      });

      if (tracks.length < targetCount) {
        throw new BadRequestException(
          'Não há tracks suficientes para este contexto',
        );
      }

      const trackById = new Map<string, TrackModel>(tracks.map((track) => [track.id, track]));
      const rankedCandidates = (mlRecommendations.trackIds || [])
        .map((trackId, index) => {
          const track = trackById.get(trackId) as TrackModel | undefined;
          if (!track) {
            return null;
          }
          const relevanceScore =
            (mlRecommendations.trackIds.length - index) /
            mlRecommendations.trackIds.length;
          const popularityScore = (track.popularity || 0) / 100;
          const score = relevanceScore * 0.7 + popularityScore * 0.3;

          return { track, score, index };
        })
        .filter(Boolean) as Array<{ track: TrackModel; score: number; index: number }>;

      if (rankedCandidates.length < targetCount) {
        throw new BadRequestException(
          'Não há tracks suficientes para este contexto',
        );
      }

      rankedCandidates.sort(
        (a, b) => b.score - a.score || a.index - b.index,
      );

      const selectedTracks = rankedCandidates
        .slice(0, targetCount)
        .map((item) => item.track);

      // Enriquecer com features e explicações
      const enrichedTracks = selectedTracks.map((track, index) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artists,
        album: track.albumName,
        genre: track.trackGenre,
        popularity: track.popularity,
        features: {
          energy: track.energy,
          valence: track.valence,
          danceability: track.danceability,
          acousticness: track.acousticness,
          instrumentalness: track.instrumentalness,
          tempo: track.tempo,
        },
        explanation: this.generateExplanation(
          track,
          dto.objective,
          dto.mood,
          dto.energyLevel,
        ),
        reason: mlRecommendations.reasons?.[index] || 'Recomendado especialmente para você',
      }));

      // Criar playlist no banco
      const playlist = await this.playlistService.createPlaylist({
        userId,
        name: this.generatePlaylistName(dto.objective, dto.mood),
        objective: dto.objective,
        energyLevel: dto.energyLevel,
        mood: dto.mood,
        type: 'ON_DEMAND',
        tracks: enrichedTracks.map((track, index) => ({
          id: track.id,
          position: index + 1,
        })),
      });

      this.logger.log(
        `Recomendações geradas: ${enrichedTracks.length} tracks para ${userId}`,
      );

      return {
        playlistId: playlist.id,
        playlistName: playlist.name,
        objective: dto.objective,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        generatedAt: playlist.generatedAt,
        tracks: enrichedTracks,
        totalTracks: enrichedTracks.length,
        mlModelScore: mlRecommendations.modelScore || undefined,
        explanation: `Playlist "${playlist.name}" gerada com base em suas preferências`,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao gerar recomendações: ${error?.message}`);
      throw error;
    }
  }

  /**
   * RN10, RN14-RN15: Gerar Vibe Diária automática
   */
  async generateDailyVibe(userId: string) {
    try {
      const targetCount = 10;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          onboardingProfile: true,
          genres: { include: { genre: true } },
          feedbacks: { include: { track: true } },
        },
      });

      if (!user || !user.onboardingDone) {
        throw new BadRequestException('Usuário não encontrado ou onboarding incompleto');
      }

      // Determinar objetivo baseado na hora
      const { objective, mood, energyLevel } = this.determineDailyVibe();

      // Preparar features
      const userFeatures = this.prepareUserFeatures(user);

      // Chamar ML service
      const mlRequestLimit = targetCount * 5;
      const mlRecommendations = await this.mlService.getRecommendations({
        objective,
        mood,
        energyLevel,
        userFeatures,
        limit: mlRequestLimit,
      });

      // RN24: Filtrar dislikes
      const dislikedTrackIds = await this.feedbackService.getUserDislikes(
        userId,
        objective,
      );

      const tracks = await this.prisma.track.findMany({
        where: {
          id: { in: mlRecommendations.trackIds },
          NOT: { id: { in: dislikedTrackIds } },
        },
      });

      if (tracks.length < targetCount) {
        throw new BadRequestException('Nenhuma track disponível para hoje');
      }

      const trackById = new Map<string, TrackModel>(tracks.map((track) => [track.id, track]));
      const rankedCandidates = (mlRecommendations.trackIds || [])
        .map((trackId, index) => {
          const track = trackById.get(trackId) as TrackModel | undefined;
          if (!track) {
            return null;
          }
          const relevanceScore =
            (mlRecommendations.trackIds.length - index) /
            mlRecommendations.trackIds.length;
          const popularityScore = (track.popularity || 0) / 100;
          const score = relevanceScore * 0.7 + popularityScore * 0.3;

          return { track, score, index };
        })
        .filter(Boolean) as Array<{ track: TrackModel; score: number; index: number }>;

      if (rankedCandidates.length < targetCount) {
        throw new BadRequestException('Nenhuma track disponível para hoje');
      }

      rankedCandidates.sort(
        (a, b) => b.score - a.score || a.index - b.index,
      );

      const selectedTracks = rankedCandidates
        .slice(0, targetCount)
        .map((item) => item.track);

      // Enriquecer
      const enrichedTracks = selectedTracks.map((track, index) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artists,
        album: track.albumName,
        genre: track.trackGenre,
        popularity: track.popularity,
        features: {
          energy: track.energy,
          valence: track.valence,
          danceability: track.danceability,
          acousticness: track.acousticness,
          instrumentalness: track.instrumentalness,
          tempo: track.tempo,
        },
        explanation: this.generateExplanation(track, objective, mood, energyLevel),
      }));

      // Criar playlist
      const playlist = await this.playlistService.createPlaylist({
        userId,
        name: this.generatePlaylistName(objective, mood),
        objective,
        energyLevel,
        mood,
        type: 'AUTOMATIC',
        tracks: enrichedTracks.map((track, index) => ({
          id: track.id,
          position: index + 1,
        })),
      });

      this.logger.log(`Vibe diária gerada para ${userId} às ${new Date().toLocaleTimeString()}`);

      return {
        userId,
        playlistId: playlist.id,
        playlistName: playlist.name,
        objective,
        energyLevel,
        generatedAt: playlist.generatedAt,
        tracks: enrichedTracks,
        totalTracks: enrichedTracks.length,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao gerar vibe diária: ${error?.message}`);
      throw error;
    }
  }

  /**
   * Preparar features do usuário para ML service
   */
  private prepareUserFeatures(user: any) {
    return {
      userId: user.id,
      preferredGenres: user.genres.map((ug) => ug.genre.spotifyKey),
      audioPreference: user.onboardingProfile?.audioPreference || 'MIXED',
      feedbackHistory: user.feedbacks.map((f) => ({
        trackId: f.trackId,
        reaction: f.reaction,
        trackFeatures: {
          energy: f.track.energy,
          valence: f.track.valence,
          danceability: f.track.danceability,
          acousticness: f.track.acousticness,
          instrumentalness: f.track.instrumentalness,
        },
      })),
    };
  }

  /**
   * Gerar nome descritivo para playlist
   */
  private generatePlaylistName(objective: string, mood: string): string {
    const objectiveNames: Record<string, string> = {
      FOCUS: 'Foco Total',
      WORKOUT: 'Energia Máxima',
      RELAX: 'Relaxamento Profundo',
      MOOD_BOOST: 'Boost de Vibes',
    };

    const moodNames: Record<string, string> = {
      HAPPY: 'Feliz',
      NEUTRAL: 'Neutro',
      ANXIOUS: 'Animado',
      SAD: 'Melancólico',
    };

    return `${objectiveNames[objective] || objective} - ${moodNames[mood] || mood}`;
  }

  /**
   * Determinar objetivo e mood automático baseado na hora do dia
   */
  private determineDailyVibe() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      return { objective: 'MOOD_BOOST', mood: 'HAPPY', energyLevel: 'MEDIUM' };
    } else if (hour >= 12 && hour < 18) {
      return { objective: 'FOCUS', mood: 'NEUTRAL', energyLevel: 'MEDIUM' };
    } else if (hour >= 18 && hour < 22) {
      return { objective: 'RELAX', mood: 'HAPPY', energyLevel: 'LOW' };
    } else {
      return { objective: 'RELAX', mood: 'NEUTRAL', energyLevel: 'LOW' };
    }
  }

  /**
   * RN25: Gerar explicação baseada em features
   */
  private generateExplanation(
    track: any,
    objective: string,
    mood: string,
    energyLevel: string,
  ): string {
    const reasons: string[] = [];

    if (objective === 'FOCUS' && track.acousticness > 0.7) {
      reasons.push('acústica relaxante para melhor foco');
    }

    if (objective === 'WORKOUT' && track.energy > 0.7 && track.tempo > 120) {
      reasons.push('ritmo energético perfeito para exercício');
    }

    if (objective === 'RELAX' && track.valence < 0.5 && track.acousticness > 0.6) {
      reasons.push('clima tranquilo e melancólico');
    }

    if (objective === 'MOOD_BOOST' && track.valence > 0.7 && track.danceability > 0.6) {
      reasons.push('vibra positiva e dançante');
    }

    if (energyLevel === 'HIGH' && track.energy > 0.7) {
      reasons.push('energia alta conforme solicitado');
    }

    if (energyLevel === 'LOW' && track.energy < 0.4) {
      reasons.push('energia baixa e relaxante');
    }

    return reasons.length > 0
      ? `Recomendada por: ${reasons.join(', ')}`
      : 'Recomendada com base em suas preferências';
  }
}
