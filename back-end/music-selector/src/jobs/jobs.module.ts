import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DailyVibesJob } from './daily-vibes.job';
import { CleanupTokensJob } from './cleanup-tokens.job';
import { PrismaService } from '../prisma/prisma.service';
import { PlaylistGeneratorService } from '../recommendations/services/playlist-generator.service';
import { FeedbackService } from '../recommendations/services/feedback.service';
import { MLService } from '../recommendations/services/ml.service';
import { PlaylistService } from '../recommendations/services/playlist.service';

/**
 * JobsModule: Centraliza todos os jobs/schedulers da aplicação
 * Gerencia tarefas assíncronas como Vibes Diárias, limpeza de tokens, etc.
 *
 * Jobs Registrados:
 * - DailyVibesJob: Recalcula vibes diárias às 00:00
 * - CleanupTokensJob: Limpa tokens expirados às 02:00 e 03:00 (domingo)
 */
@Module({
  imports: [HttpModule],
  providers: [
    DailyVibesJob,
    CleanupTokensJob,
    PrismaService,
    PlaylistGeneratorService,
    PlaylistService,
    FeedbackService,
    MLService,
  ],
  exports: [DailyVibesJob, CleanupTokensJob],
})
export class JobsModule {}
