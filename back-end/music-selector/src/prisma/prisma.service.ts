import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { error } from 'console';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: PrismaClient;
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    this.logger.log(`Initializing PrismaClient with DATABASE_URL: ${dbUrl ? 'SET' : 'NOT SET'}`);
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Create connection pool for PostgreSQL
    this.pool = new Pool({
      connectionString: dbUrl,
    });

    // Initialize Prisma with the adapter
    const adapter = new PrismaPg(this.pool);
    this.prismaClient = new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.prismaClient.$connect();
      this.logger.log('Database connected successfully');
    } catch (error: any) {
      this.logger.error(
        `Failed to connect to database: ${error?.message || 'unknown error'}`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
    await this.pool.end();
  }

  get user() {
    return this.prismaClient.user;
  }

  get track() {
    return this.prismaClient.track;
  }

  get playlist() {
    return this.prismaClient.playlist;
  }

  get feedback() {
    return this.prismaClient.feedback;
  }

  get genre() {
    return this.prismaClient.genre;
  }

  get userGenre() {
    return this.prismaClient.userGenre;
  }

  get onboardingProfile() {
    return this.prismaClient.onboardingProfile;
  }

  get playlistTrack() {
    return this.prismaClient.playlistTrack;
  }

  get passwordResetToken() {
    return this.prismaClient.passwordResetToken;
  }

  get $connect() {
    return this.prismaClient.$connect.bind(this.prismaClient);
  }

  get $disconnect() {
    return this.prismaClient.$disconnect.bind(this.prismaClient);
  }
}