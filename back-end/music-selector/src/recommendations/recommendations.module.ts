import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';
import { MLService } from './services/ml.service';
import { PlaylistService } from './services/playlist.service';
import { FeedbackService } from './services/feedback.service';
import { PlaylistGeneratorService } from './services/playlist-generator.service';

@Module({
  imports: [HttpModule],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    PlaylistGeneratorService,
    PlaylistService,
    FeedbackService,
    MLService,
    PrismaService,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
