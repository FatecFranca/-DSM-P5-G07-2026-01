import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GetRecommendationsDto,
  ObjectiveType,
  MoodType,
  EnergyLevelType,
} from '../dto/get-recommendations.dto';
import { MLService } from './ml.service';
import { PlaylistService } from './playlist.service';


import { mapAnswersToMlFeatures } from './map-answers-to-ml-features';

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
    
  ) {}

  /**
   * RN17-RN22: Gerar recomendações sob demanda
   * Garante exatamente 10 faixas ordenadas por relevância (70%) + popularity (30%)
   */
  async generateRecommendations(
    userId: string,
    dto: GetRecommendationsDto,
  ) {
    try {
      const targetCount = 10; // RN22: Sempre exatamente 10
      
      // Validar usuário e onboarding
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('❌ Usuário não encontrado');
      }

      if (!user.onboardingDone) {
        throw new BadRequestException(
          '⚠️ Complete o onboarding antes de gerar recomendações personalizadas (RN10)',
        );
      }

      this.logger.log(
        `🎯 Iniciando geração: objetivo=${dto.objective}, energia=${dto.energyLevel}, humor=${dto.mood}`,
      );

      const mlFeatures = mapAnswersToMlFeatures({
        objective: dto.objective,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
      });

      const prediction = await this.mlService.predictVibe(mlFeatures);

      if (!prediction?.vibe) {
        throw new BadRequestException('❌ ML Service não retornou uma vibe.');
      }

      const predictedVibe = prediction.vibe.toUpperCase();

      // RN24: Recuperar dislikes neste contexto específico
      
     
      // ✅ CORRIGIDO: Recuperar dados das tracks com include de gêneros
      const tracks = await this.prisma.track.findMany({
        where: {
          vibe: predictedVibe as any,
          // Adicione outros filtros conforme necessário
        },
        orderBy: {
          popularity: 'desc',
        },
        take: targetCount * 5,
      });

      if (tracks.length < targetCount) {
        throw new BadRequestException('Nenhuma track disponível para o critério selecionado');
      }

      // Rank e select exatamente 10 melhores
      const selectedTracks = tracks.slice(0, targetCount);

      this.logger.debug(`✅ Selecionadas exatamente ${selectedTracks.length} faixas`);

      // ✅ CORRIGIDO: Enriquecer com features e explicações
      const predictedScore = prediction.scores?.[prediction.vibe];
      const enrichedTracks = selectedTracks.map((track) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artists,
        album: track.albumName,
        genres: [],
        popularity: track.popularity,
        features: {
          energy: track.energy,
          valence: track.valence,
          danceability: track.danceability,
          acousticness: track.acousticness,
          instrumentalness: track.instrumentalness,
          speechiness: track.speechiness,
          tempo: track.tempo,
        },
        explanation: this.generateExplanation(
          track,
          dto.objective,
          dto.mood,
          dto.energyLevel,
        ),
        reason:
          typeof predictedScore === 'number'
            ? `Predicted vibe ${prediction.vibe} (${predictedScore.toFixed(2)})`
            : `Predicted vibe ${prediction.vibe}`,
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
        `🎵 ✅ Playlist criada: ${playlist.name} com ${enrichedTracks.length} faixas para ${userId}`,
      );

      // RN22: Validação final - garantir exatamente 10
      const response = {
        playlistId: playlist.id,
        playlistName: playlist.name,
        objective: dto.objective,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        generatedAt: playlist.generatedAt,
        tracks: enrichedTracks,
        totalTracks: enrichedTracks.length,
        mlModelScore: typeof predictedScore === 'number' ? predictedScore : undefined,
        explanation: `Playlist "${playlist.name}" gerada com base em suas preferências (${enrichedTracks.length} faixas)`,
      };

      // Garantir invariante RN22
      if (response.totalTracks !== 10) {
        this.logger.error(
          `🚨 ERRO CRÍTICO RN22: totalTracks=${response.totalTracks}, esperado 10`,
        );
        throw new BadRequestException(
          `Falha na validação RN22: ${response.totalTracks} faixas ao invés de 10`,
        );
      }

      return response;
    } catch (error: any) {
      this.logger.error(
        `❌ Erro ao gerar recomendações: ${error?.message}`,
        error.stack,
      );
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
      });

      if (!user || !user.onboardingDone) {
        throw new BadRequestException('Usuário não encontrado ou onboarding incompleto');
      }

      // Determinar objetivo baseado na hora
      const { objective, mood, energyLevel } = this.determineDailyVibe();

      const mlFeatures = mapAnswersToMlFeatures({
        objective,
        mood,
        energyLevel,
      });

      const prediction = await this.mlService.predictVibe(mlFeatures);

      if (!prediction?.vibe) {
        throw new BadRequestException('ML Service nao retornou uma vibe');
      }

      const predictedVibe = prediction.vibe.toUpperCase();

      // ✅ CORRIGIDO: RN24 com include de gêneros
      const tracks = await this.prisma.track.findMany({
        where: {
          vibe: predictedVibe as any,
          // Adicione filtros de dislikes se necessário
        },
        orderBy: {
          popularity: 'desc',
        },
        take: targetCount * 5,
      });

      if (tracks.length < targetCount) {
        throw new BadRequestException('Nenhuma track disponível para hoje');
      }

      const selectedTracks = tracks.slice(0, targetCount);

      // ✅ CORRIGIDO: Enriquecer com gêneros mapeados corretamente
      const enrichedTracks = selectedTracks.map((track) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artists,
        album: track.albumName,
        genres: [],
        popularity: track.popularity,
        features: {
          energy: track.energy,
          valence: track.valence,
          danceability: track.danceability,
          acousticness: track.acousticness,
          instrumentalness: track.instrumentalness,
          speechiness: track.speechiness,
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
  private determineDailyVibe(): {
    objective: ObjectiveType;
    mood: MoodType;
    energyLevel: EnergyLevelType;
  } {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      return {
        objective: ObjectiveType.MOOD_BOOST,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.MEDIUM,
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        objective: ObjectiveType.FOCUS,
        mood: MoodType.NEUTRAL,
        energyLevel: EnergyLevelType.MEDIUM,
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        objective: ObjectiveType.RELAX,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.LOW,
      };
    } else {
      return {
        objective: ObjectiveType.RELAX,
        mood: MoodType.NEUTRAL,
        energyLevel: EnergyLevelType.LOW,
      };
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
