import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MoodType,
  EnergyLevelType,
  AudioPreference,
  GetRecommendationsDto,
} from '../dto/get-recommendations.dto';
import { MLService } from './ml.service';
import { PlaylistService } from './playlist.service';
import { mapAnswersToMlFeatures } from './map-answers-to-ml-features';

/**
 * PlaylistGeneratorService: Lógica de geração de playlists
 * ✅ REFATORADO: Filtros do Prisma corrigidos para usar as features reais da model Track
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
   */
  async generateRecommendations(userId: string, dto: GetRecommendationsDto) {
    try {
      const targetCount = 10;

      // Validar usuário e onboarding
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('❌ Usuário não encontrado');
      }

     

      this.logger.log(
        `🎯 Iniciando geração: audioPreference=${dto.audioPreference}, energia=${dto.energyLevel}, humor=${dto.mood}`,
      );

      const mlFeatures = mapAnswersToMlFeatures({
        audioPreference: dto.audioPreference,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
      });

      const prediction = await this.mlService.predictVibe(mlFeatures);

      if (!prediction?.vibe) {
        throw new BadRequestException('❌ ML Service não retornou uma vibe.');
      }

      const predictedVibe = prediction.vibe.toUpperCase();

      // ✅ CORRIGIDO: Filtro dinâmico usando a feature acústica real da tabela Track
      const acousticFilter: any = {};
      if (dto.audioPreference === AudioPreference.INSTRUMENTAL) {
        acousticFilter.instrumentalness = { gte: 0.5 }; // Músicas predominantemente instrumentais
      } else if (dto.audioPreference === AudioPreference.VOCAL) {
        acousticFilter.instrumentalness = { lt: 0.5 };  // Músicas com mais foco em vocais
      }

      const tracks = await this.prisma.track.findMany({
        where: {
          vibe: predictedVibe as any,
          ...acousticFilter, // ◄ Injeta o filtro aceito pelo Prisma (ex: instrumentalness)
        },
        orderBy: {
          popularity: 'desc',
        },
        take: targetCount * 5,
      });

      if (tracks.length < targetCount) {
        throw new BadRequestException('Nenhuma track disponível para o critério selecionado');
      }

      const selectedTracks = tracks.slice(0, targetCount);
      this.logger.debug(`✅ Selecionadas exatamente ${selectedTracks.length} faixas`);

      const predictedScore = prediction.scores?.[prediction.vibe];
      const enrichedTracks = selectedTracks.map((track) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artists,
        album: track.albumName,     
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
          dto.audioPreference,
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
        name: this.generatePlaylistName(dto.audioPreference, dto.mood),
        audioPreference: dto.audioPreference,
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

      const response = {
        playlistId: playlist.id,
        playlistName: playlist.name,
        audioPreference: dto.audioPreference,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        generatedAt: playlist.generatedAt,
        tracks: enrichedTracks,
        totalTracks: enrichedTracks.length,
        mlModelScore: typeof predictedScore === 'number' ? predictedScore : undefined,
        explanation: `Playlist "${playlist.name}" gerada com base em suas preferências (${enrichedTracks.length} faixas)`,
      };

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

      const { audioPreference, mood, energyLevel } = this.determineDailyVibe();

      const mlFeatures = mapAnswersToMlFeatures({
        audioPreference,
        mood,
        energyLevel,
      });

      const prediction = await this.mlService.predictVibe(mlFeatures);

      if (!prediction?.vibe) {
        throw new BadRequestException('ML Service nao retornou uma vibe');
      }

      const predictedVibe = prediction.vibe.toUpperCase();

      // ✅ CORRIGIDO: Filtro dinâmico para a Vibe Diária
      const acousticFilter: any = {};
      if (audioPreference === AudioPreference.INSTRUMENTAL) {
        acousticFilter.instrumentalness = { gte: 0.5 };
      } else if (audioPreference === AudioPreference.VOCAL) {
        acousticFilter.instrumentalness = { lt: 0.5 };
      }

      const tracks = await this.prisma.track.findMany({
        where: {
          vibe: predictedVibe as any,
          ...acousticFilter, // ◄ Injeta o filtro mapeado sem quebrar o TypeScript
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

      const enrichedTracks = selectedTracks.map((track) => ({
        id: track.id,
        title: track.trackName,
        artist: track.artists,
        album: track.albumName,
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
          audioPreference,
          mood,
          energyLevel,
        ),
      }));

      const playlist = await this.playlistService.createPlaylist({
        userId,
        name: this.generatePlaylistName(audioPreference, mood),
        audioPreference,
        energyLevel,
        mood,
        type: 'AUTOMATIC',
        tracks: enrichedTracks.map((track, index) => ({
          id: track.id,
          position: index + 1,
        })),
      });

      this.logger.log(
        `Vibe diária gerada para ${userId} às ${new Date().toLocaleTimeString()}`,
      );

      return {
        userId,
        playlistId: playlist.id,
        playlistName: playlist.name,
        audioPreference,
        mood,
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
   * Gera nome baseado em audioPreference e mood
   */
  private generatePlaylistName(audioPreference: AudioPreference, mood: MoodType): string {
    const audioNames: Record<AudioPreference, string> = {
      [AudioPreference.INSTRUMENTAL]: '🎼 Instrumental',
      [AudioPreference.VOCAL]: '🎤 Vocal',
      [AudioPreference.MIXED]: '🎵 Mixed',
    };

    const moodNames: Record<MoodType, string> = {
      [MoodType.HAPPY]: '😊 Feliz',
      [MoodType.NEUTRAL]: '😐 Neutro',
      [MoodType.ANXIOUS]: '⚡ Animado',
      [MoodType.SAD]: '😢 Melancólico',
    };

    return `${audioNames[audioPreference]} - ${moodNames[mood]}`;
  }

  /**
   * Determinar parâmetros automáticos baseado na hora
   */
  private determineDailyVibe(): {
    audioPreference: AudioPreference;
    mood: MoodType;
    energyLevel: EnergyLevelType;
  } {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      return {
        audioPreference: AudioPreference.INSTRUMENTAL,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.MEDIUM,
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        audioPreference: AudioPreference.MIXED,
        mood: MoodType.NEUTRAL,
        energyLevel: EnergyLevelType.MEDIUM,
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        audioPreference: AudioPreference.INSTRUMENTAL,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.LOW,
      };
    } else {
      return {
        audioPreference: AudioPreference.INSTRUMENTAL,
        mood: MoodType.NEUTRAL,
        energyLevel: EnergyLevelType.LOW,
      };
    }
  }

  /**
   * RN25: Gerar explicação baseada em features reais
   */
  private generateExplanation(
    track: any,
    audioPreference: AudioPreference,
    mood: MoodType,
    energyLevel: EnergyLevelType,
  ): string {
    const reasons: string[] = [];

    if (audioPreference === AudioPreference.INSTRUMENTAL && track.instrumentalness > 0.7) {
      reasons.push('instrumental conforme preferência');
    }

    if (audioPreference === AudioPreference.VOCAL && track.speechiness > 0.3) {
      reasons.push('vocal destacado conforme preferência');
    }

    if (mood === MoodType.HAPPY && track.valence > 0.7) {
      reasons.push('vibra positiva para seu humor feliz');
    }

    if (mood === MoodType.SAD && track.valence < 0.5) {
      reasons.push('tom melancólico que combina com seu mood');
    }

    if (energyLevel === EnergyLevelType.HIGH && track.energy > 0.7) {
      reasons.push('energia alta conforme solicitado');
    }

    if (energyLevel === EnergyLevelType.LOW && track.energy < 0.4) {
      reasons.push('energia baixa e relaxante');
    }

    if (energyLevel === EnergyLevelType.MEDIUM && track.energy >= 0.4 && track.energy <= 0.7) {
      reasons.push('energia balanceada');
    }

    return reasons.length > 0
      ? `Recomendada por: ${reasons.join(', ')}`
      : 'Recomendada com base em suas preferências';
  }
}