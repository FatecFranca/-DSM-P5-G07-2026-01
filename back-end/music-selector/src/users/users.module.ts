import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';
import { EmailService } from './services/email.service';

@Module({
  imports: [forwardRef(() => AuthModule), JobsModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, EmailService],
  exports: [UsersService, EmailService],
})
export class UsersModule {}
