import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PlaylistService: Gerenciar playlists (criar, recuperar, atualizar)
 * Responsável pela persistência de playlists no banco
 */
@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlaylistService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Criar nova playlist com tracks
   */
  async createPlaylist(data: {
    userId: string;
    name: string;
    objective: string;
    energyLevel: string;
    mood: string;
    type: string;
    tracks: Array<{ id: string; position: number }>;
  }) {
    try {
      const playlist = await this.prisma.playlist.create({
        data: {
          userId: data.userId,
          name: data.name,
          objective: data.objective as any,
          energyLevel: data.energyLevel as any,
          mood: data.mood as any,
          type: data.type as any,
          tracks: {
            createMany: {
              data: data.tracks.map((track) => ({
                trackId: track.id,
                position: track.position,
              })),
            },
          },
        },
        include: { tracks: { include: { track: true } } },
      });

      this.logger.log(
        `Playlist criada: ${playlist.id} com ${data.tracks.length} tracks`,
      );
      return playlist;
    } catch (error: any) {
      this.logger.error(`Erro ao criar playlist: ${error?.message}`);
      throw error;
    }
  }

  /**
   * RN14: Recuperar histórico de playlists do usuário
   */
  async getUserPlaylistHistory(userId: string, limit: number = 10) {
    try {
      const playlists = await this.prisma.playlist.findMany({
        where: { userId },
        orderBy: { generatedAt: 'desc' },
        take: limit,
        include: {
          tracks: {
            include: { track: true },
            orderBy: { position: 'asc' },
          },
        },
      });

      this.logger.log(
        `Histórico recuperado: ${playlists.length} playlists para usuário ${userId}`,
      );
      return playlists;
    } catch (error: any) {
      this.logger.error(`Erro ao recuperar histórico: ${error?.message}`);
      throw error;
    }
  }

  /**
   * Recuperar detalhes de uma playlist específica
   */
  async getPlaylistDetails(playlistId: string, userId?: string) {
    try {
      const playlist = await this.prisma.playlist.findUnique({
        where: { id: playlistId },
        include: {
          tracks: {
            include: { track: true },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!playlist) {
        throw new BadRequestException('Playlist não encontrada');
      }

      // Verificar se usuário é o proprietário (opcional)
      if (userId && playlist.userId !== userId) {
        throw new BadRequestException('Acesso negado a esta playlist');
      }

      return playlist;
    } catch (error: any) {
      this.logger.error(`Erro ao recuperar detalhes da playlist: ${error?.message}`);
      throw error;
    }
  }

  /**
   * RN14-RN15: Recuperar Vibes Diárias (playlists automáticas)
   */
  async getUserDailyVibes(userId: string) {
    try {
      const vibes = await this.prisma.playlist.findMany({
        where: {
          userId,
          type: 'AUTOMATIC',
          generatedAt: {
            // Playlists geradas nas últimas 24 horas
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { generatedAt: 'desc' },
        take: 3,
        include: {
          tracks: {
            include: { track: true },
            orderBy: { position: 'asc' },
          },
        },
      });

      this.logger.log(`Vibes diárias recuperadas: ${vibes.length} para usuário ${userId}`);
      return vibes;
    } catch (error: any) {
      this.logger.error(`Erro ao recuperar vibes diárias: ${error?.message}`);
      throw error;
    }
  }

  /**
   * Deletar playlist (e seus tracks automaticamente pela FK)
   */
  async deletePlaylist(playlistId: string, userId: string) {
    try {
      const playlist = await this.prisma.playlist.findUnique({
        where: { id: playlistId },
      });

      if (!playlist || playlist.userId !== userId) {
        throw new BadRequestException('Playlist não encontrada ou acesso negado');
      }

      await this.prisma.playlist.delete({
        where: { id: playlistId },
      });

      this.logger.log(`Playlist deletada: ${playlistId}`);
      return { message: 'Playlist deletada com sucesso' };
    } catch (error: any) {
      this.logger.error(`Erro ao deletar playlist: ${error?.message}`);
      throw error;
    }
  }
}
