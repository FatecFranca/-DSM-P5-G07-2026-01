import { Module } from '@nestjs/common';
import { CleanupTokensJob } from './cleanup-tokens.job';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CleanupTokensJob, PrismaService],
  exports: [CleanupTokensJob],
})
export class JobsModule {}
