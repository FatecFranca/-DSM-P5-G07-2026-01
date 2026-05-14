import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { PlaylistGeneratorService } from './services/playlist-generator.service';
import { PlaylistService } from './services/playlist.service';
import { FeedbackService } from './services/feedback.service';
import { GetRecommendationsDto, ObjectiveType, MoodType, EnergyLevelType } from './dto/get-recommendations.dto';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let playlistGeneratorService: PlaylistGeneratorService;
  let playlistService: PlaylistService;
  let feedbackService: FeedbackService;

  const mockPlaylist = {
    id: 'playlist1',
    userId: 'user123',
    name: 'My Playlist',
    objective: ObjectiveType.FOCUS,
    energyLevel: EnergyLevelType.HIGH,
    mood: MoodType.HAPPY,
    type: 'ON_DEMAND',
    generatedAt: new Date(),
    tracks: [],
  };

  const mockRecommendationResponse = {
    userId: 'user123',
    playlistId: 'playlist1',
    playlistName: 'My Playlist',
    objective: ObjectiveType.FOCUS,
    energyLevel: EnergyLevelType.HIGH,
    mood: MoodType.HAPPY,
    generatedAt: new Date(),
    tracks: [],
    totalTracks: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: PlaylistGeneratorService,
          useValue: {
            generateRecommendations: jest.fn(),
            generateDailyVibe: jest.fn(),
          },
        },
        {
          provide: PlaylistService,
          useValue: {
            getUserPlaylistHistory: jest.fn(),
            getUserDailyVibes: jest.fn(),
            getPlaylistDetails: jest.fn(),
            deletePlaylist: jest.fn(),
          },
        },
        {
          provide: FeedbackService,
          useValue: {
            recordFeedback: jest.fn(),
            getUserFeedbackHistory: jest.fn(),
            getUserFeedbackStats: jest.fn(),
            clearUserFeedback: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    playlistGeneratorService = module.get<PlaylistGeneratorService>(PlaylistGeneratorService);
    playlistService = module.get<PlaylistService>(PlaylistService);
    feedbackService = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have PlaylistGeneratorService injected', () => {
      expect(playlistGeneratorService).toBeDefined();
    });

    it('should have PlaylistService injected', () => {
      expect(playlistService).toBeDefined();
    });

    it('should have FeedbackService injected', () => {
      expect(feedbackService).toBeDefined();
    });
  });

  describe('getRecommendations', () => {
    const dto: GetRecommendationsDto = {
      objective: ObjectiveType.FOCUS,
      mood: MoodType.HAPPY,
      energyLevel: EnergyLevelType.HIGH,
      limit: 10,
    };

    it('should return recommendations from PlaylistGeneratorService', async () => {
      jest
        .spyOn(playlistGeneratorService, 'generateRecommendations')
        .mockResolvedValue(mockRecommendationResponse as any);

      const result = await service.getRecommendations('user123', dto);

      expect(result).toBeDefined();
      expect(playlistGeneratorService.generateRecommendations).toHaveBeenCalledWith('user123', dto);
    });

    it('should call service with correct parameters', async () => {
      jest
        .spyOn(playlistGeneratorService, 'generateRecommendations')
        .mockResolvedValue(mockRecommendationResponse as any);

      await service.getRecommendations('user456', dto);

      expect(playlistGeneratorService.generateRecommendations).toHaveBeenCalledWith(
        'user456',
        expect.objectContaining({
          objective: ObjectiveType.FOCUS,
          mood: MoodType.HAPPY,
          energyLevel: EnergyLevelType.HIGH,
        }),
      );
    });
  });

  describe('generateDailyVibe', () => {
    it('should generate daily vibe from PlaylistGeneratorService', async () => {
      jest
        .spyOn(playlistGeneratorService, 'generateDailyVibe')
        .mockResolvedValue(mockRecommendationResponse as any);

      const result = await service.generateDailyVibe('user123');

      expect(result).toBeDefined();
      expect(playlistGeneratorService.generateDailyVibe).toHaveBeenCalledWith('user123');
    });

    it('should return response with required properties', async () => {
      jest
        .spyOn(playlistGeneratorService, 'generateDailyVibe')
        .mockResolvedValue(mockRecommendationResponse as any);

      const result = await service.generateDailyVibe('user123');

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('playlistId');
      expect(result).toHaveProperty('tracks');
    });
  });

  describe('getUserPlaylistHistory', () => {
    it('should retrieve playlist history from PlaylistService', async () => {
      const mockHistory = [mockPlaylist];
      jest
        .spyOn(playlistService, 'getUserPlaylistHistory')
        .mockResolvedValue(mockHistory as any);

      const result = await service.getUserPlaylistHistory('user123', 10);

      expect(result).toEqual(mockHistory);
      expect(playlistService.getUserPlaylistHistory).toHaveBeenCalledWith('user123', 10);
    });

    it('should handle different limit parameters', async () => {
      jest
        .spyOn(playlistService, 'getUserPlaylistHistory')
        .mockResolvedValue([]);

      await service.getUserPlaylistHistory('user123', 50);

      expect(playlistService.getUserPlaylistHistory).toHaveBeenCalledWith('user123', 50);
    });
  });

  describe('recordFeedback', () => {
    it('should record feedback using FeedbackService', async () => {
      const mockFeedback = {
        id: 'feedback1',
        userId: 'user123',
        trackId: 'track1',
        reaction: 'LIKE',
        objectiveContext: 'FOCUS',
      };

      jest
        .spyOn(feedbackService, 'recordFeedback')
        .mockResolvedValue(mockFeedback as any);

      const result = await service.recordFeedback('user123', 'track1', 'LIKE', 'FOCUS');

      expect(result).toBeDefined();
      expect(feedbackService.recordFeedback).toHaveBeenCalledWith('user123', 'track1', 'LIKE', 'FOCUS');
    });

    it('should pass correct parameters to feedback service', async () => {
      jest
        .spyOn(feedbackService, 'recordFeedback')
        .mockResolvedValue({} as any);

      await service.recordFeedback('user456', 'track789', 'DISLIKE', 'RELAX');

      expect(feedbackService.recordFeedback).toHaveBeenCalledWith(
        'user456',
        'track789',
        'DISLIKE',
        'RELAX',
      );
    });
  });

  describe('getUserFeedbackHistory', () => {
    it('should retrieve feedback history from FeedbackService', async () => {
      const mockHistory = [];
      jest
        .spyOn(feedbackService, 'getUserFeedbackHistory')
        .mockResolvedValue(mockHistory as any);

      const result = await service.getUserFeedbackHistory('user123', 50);

      expect(result).toEqual(mockHistory);
      expect(feedbackService.getUserFeedbackHistory).toHaveBeenCalledWith('user123', 50);
    });

    it('should handle different limit parameters', async () => {
      jest
        .spyOn(feedbackService, 'getUserFeedbackHistory')
        .mockResolvedValue([]);

      await service.getUserFeedbackHistory('user123', 100);

      expect(feedbackService.getUserFeedbackHistory).toHaveBeenCalledWith('user123', 100);
    });
  });
});

