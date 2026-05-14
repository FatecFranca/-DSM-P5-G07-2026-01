import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: {
            user: {},
            track: {},
            playlist: {},
            feedback: {},
            genre: {},
            userGenre: {},
            onboardingProfile: {},
            playlistTrack: {},
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            onModuleInit: jest.fn(),
            onModuleDestroy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (service?.onModuleDestroy) {
      await service.onModuleDestroy();
    }
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required models', () => {
      expect(service.user).toBeDefined();
      expect(service.track).toBeDefined();
      expect(service.playlist).toBeDefined();
      expect(service.feedback).toBeDefined();
      expect(service.genre).toBeDefined();
      expect(service.userGenre).toBeDefined();
      expect(service.onboardingProfile).toBeDefined();
      expect(service.playlistTrack).toBeDefined();
    });
  });

  describe('lifecycle', () => {
    it('should have onModuleInit method', () => {
      expect(service.onModuleInit).toBeDefined();
    });

    it('should have onModuleDestroy method', () => {
      expect(service.onModuleDestroy).toBeDefined();
    });

    it('should call onModuleInit during initialization', async () => {
      await service.onModuleInit();
      expect(service.onModuleInit).toHaveBeenCalled();
    });

    it('should call onModuleDestroy during cleanup', async () => {
      await service.onModuleDestroy();
      expect(service.onModuleDestroy).toHaveBeenCalled();
    });
  });

  describe('database models', () => {
    it('should return user model', () => {
      const userModel = service.user;
      expect(userModel).toBeDefined();
    });

    it('should return track model', () => {
      const trackModel = service.track;
      expect(trackModel).toBeDefined();
    });

    it('should return playlist model', () => {
      const playlistModel = service.playlist;
      expect(playlistModel).toBeDefined();
    });

    it('should return feedback model', () => {
      const feedbackModel = service.feedback;
      expect(feedbackModel).toBeDefined();
    });

    it('should return genre model', () => {
      const genreModel = service.genre;
      expect(genreModel).toBeDefined();
    });

    it('should return userGenre model', () => {
      const userGenreModel = service.userGenre;
      expect(userGenreModel).toBeDefined();
    });

    it('should return onboardingProfile model', () => {
      const onboardingProfileModel = service.onboardingProfile;
      expect(onboardingProfileModel).toBeDefined();
    });

    it('should return playlistTrack model', () => {
      const playlistTrackModel = service.playlistTrack;
      expect(playlistTrackModel).toBeDefined();
    });
  });

  describe('connection methods', () => {
    it('should have $connect method', () => {
      const connect = service.$connect;
      expect(connect).toBeDefined();
    });

    it('should have $disconnect method', () => {
      const disconnect = service.$disconnect;
      expect(disconnect).toBeDefined();
    });
  });
});
