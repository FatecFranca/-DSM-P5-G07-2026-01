import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Vibe } from '../../generated/prisma/enums';
import type { TrackModel } from '../../generated/prisma/models/Track';
import {
  GetRecommendationsDto,
  MoodType,
  ObjectiveType,
} from '../dto/get-recommendations.dto';
import { MLService } from './ml.service';
import { PlaylistService } from './playlist.service';
import { mapAnswersToMlFeatures } from './map-answers-to-ml-features';

@Injectable()
export class PlaylistGeneratorService {
  private readonly logger = new Logger(PlaylistGeneratorService.name);
  private readonly targetCount = 10;

  constructor(
    private prisma: PrismaService,
    private mlService: MLService,
    private playlistService: PlaylistService,
  ) {}

  async generateRecommendations(userId: string, dto: GetRecommendationsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario nao encontrado');
    }

    this.logger.log(
      `Gerando playlist: objective=${dto.objective}, mood=${dto.mood}, energyLevel=${dto.energyLevel}`,
    );

    const mlFeatures = mapAnswersToMlFeatures({
      objective: dto.objective,
      mood: dto.mood,
      energyLevel: dto.energyLevel,
    });

    const prediction = await this.mlService.predictVibe(mlFeatures);

    if (!prediction?.vibe) {
      throw new BadRequestException('ML Service nao retornou uma vibe');
    }

    const predictedVibe = prediction.vibe.toUpperCase();
    const tracks = await this.prisma.track.findMany({
      where: {
        vibe: predictedVibe as Vibe,
      },
      orderBy: {
        popularity: 'desc',
      },
      take: this.targetCount,
    });

    if (tracks.length < this.targetCount) {
      throw new BadRequestException(
        `Nao ha 10 tracks disponiveis para a vibe ${predictedVibe}`,
      );
    }

    const enrichedTracks = this.enrichTracks(tracks);

    return this.createPlaylistResponse(
      userId,
      dto,
      predictedVibe,
      enrichedTracks,
      prediction,
      'ON_DEMAND',
    );
  }

  private async createPlaylistResponse(
    userId: string,
    dto: GetRecommendationsDto,
    predictedVibe: string,
    enrichedTracks: Array<{
      id: string;
      title: string;
      artist: string;
      album: string;
      popularity: number;
      features: Record<string, number>;
    }>,
    prediction: { vibe: string; scores?: Record<string, number> },
    type: 'ON_DEMAND',
  ) {
    const playlist = await this.playlistService.createPlaylist({
      userId,
      name: this.generateObjectivePlaylistName(dto.objective, dto.mood),
      energyLevel: dto.energyLevel,
      mood: dto.mood,
      type,
      tracks: enrichedTracks.map((track, index) => ({
        id: track.id,
        position: index + 1,
      })),
    });

    return {
      playlistId: playlist.id,
      playlistName: playlist.name,
      objective: dto.objective,
      mood: dto.mood,
      energyLevel: dto.energyLevel,
      predictedVibe,
      generatedAt: playlist.generatedAt,
      tracks: enrichedTracks,
      totalTracks: enrichedTracks.length,
      mlModelScore: prediction.scores?.[prediction.vibe],
    };
  }

  private enrichTracks(tracks: TrackModel[]) {
    return tracks.map((track) => ({
      id: track.id,
      title: track.trackName,
      artist: track.artists,
      album: track.albumName,
      popularity: track.popularity,
      features: {
        danceability: track.danceability,
        energy: track.energy,
        valence: track.valence,
        acousticness: track.acousticness,
        instrumentalness: track.instrumentalness,
        speechiness: track.speechiness,
        tempo: track.tempo,
      },
    }));
  }

  private generateObjectivePlaylistName(
    objective: ObjectiveType,
    mood: MoodType,
  ): string {
    const objectiveNames: Record<ObjectiveType, string> = {
      [ObjectiveType.FOCUS]: 'Focus',
      [ObjectiveType.WORKOUT]: 'Workout',
      [ObjectiveType.RELAX]: 'Relax',
      [ObjectiveType.MOOD_BOOST]: 'Mood Boost',
    };

    return `${objectiveNames[objective]} ${mood} Vibe`;
  }
}
