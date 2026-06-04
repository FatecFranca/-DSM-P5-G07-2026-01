import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlaylistType } from '../../generated/prisma/enums';
import { EnergyLevelType, MoodType } from '../dto/get-recommendations.dto';

@Injectable()
export class PlaylistService {
  private readonly logger = new Logger(PlaylistService.name);

  constructor(private prisma: PrismaService) {}

  async createPlaylist(data: {
    userId: string;
    name: string;
    energyLevel: EnergyLevelType;
    mood: MoodType;
    type: PlaylistType;
    tracks: Array<{ id: string; position: number }>;
  }) {
    const playlist = await this.prisma.playlist.create({
      data: {
        userId: data.userId,
        name: data.name,
        energyLevel: data.energyLevel,
        mood: data.mood,
        type: data.type,
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
  }

  async getUserPlaylistHistory(userId: string, limit: number = 10) {
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
      `Historico recuperado: ${playlists.length} playlists para usuario ${userId}`,
    );

    return playlists;
  }

  async getPlaylistDetails(playlistId: string, userId?: string) {
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
      throw new BadRequestException('Playlist nao encontrada');
    }

    if (userId && playlist.userId !== userId) {
      throw new BadRequestException('Acesso negado a esta playlist');
    }

    return playlist;
  }

  async deletePlaylist(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist || playlist.userId !== userId) {
      throw new BadRequestException('Playlist nao encontrada ou acesso negado');
    }

    await this.prisma.playlist.delete({
      where: { id: playlistId },
    });

    this.logger.log(`Playlist deletada: ${playlistId}`);

    return { message: 'Playlist deletada com sucesso' };
  }
}
