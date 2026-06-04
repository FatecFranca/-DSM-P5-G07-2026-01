import { Injectable } from '@nestjs/common';
import { GetRecommendationsDto } from './dto/get-recommendations.dto';
import { PlaylistGeneratorService } from './services/playlist-generator.service';
import { PlaylistService } from './services/playlist.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private playlistGeneratorService: PlaylistGeneratorService,
    private playlistService: PlaylistService,
  ) {}

  async getRecommendations(userId: string, dto: GetRecommendationsDto) {
    return this.playlistGeneratorService.generateRecommendations(userId, dto);
  }

  async getUserPlaylistHistory(userId: string, limit: number = 10) {
    return this.playlistService.getUserPlaylistHistory(userId, limit);
  }

  async getPlaylistDetails(playlistId: string, userId: string) {
    return this.playlistService.getPlaylistDetails(playlistId, userId);
  }

  async deletePlaylist(playlistId: string, userId: string) {
    return this.playlistService.deletePlaylist(playlistId, userId);
  }
}
