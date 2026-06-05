import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import {
  GetRecommendationsDto,
  ObjectiveType,
  MoodType,
  EnergyLevelType,
} from './dto/get-recommendations.dto';

describe('RecommendationsController', () => {
  let controller: RecommendationsController;
  let service: RecommendationsService;

  const mockRequest = {
    user: {
      id: 'user123',
      email: 'test@example.com',
    },
  };

  const mockRecommendationResponse = {
    playlistId: 'playlist1',
    playlistName: 'My Playlist',
    objective: ObjectiveType.FOCUS,
    mood: MoodType.HAPPY,
    energyLevel: EnergyLevelType.HIGH,
    predictedVibe: 'FOCUS',
    generatedAt: new Date(),
    tracks: [
      {
        id: 'track1',
        title: 'Song 1',
        artist: 'Artist 1',
        album: 'Album 1',
        genre: 'Rock',
        popularity: 80,
        features: {
          energy: 0.75,
          valence: 0.65,
          danceability: 0.7,
          acousticness: 0.1,
          instrumentalness: 0.05,
          speechiness: 0.08,
          tempo: 120,
        },
        explanation: 'Recommended for focus',
      },
    ],
    totalTracks: 1,
    mlModelScore: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        {
          provide: RecommendationsService,
          useValue: {
            getRecommendations: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecommendationsController>(
      RecommendationsController,
    );
    service = module.get<RecommendationsService>(RecommendationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have RecommendationsService injected', () => {
      expect(service).toBeDefined();
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations when provided with valid DTO', async () => {
      const dto: GetRecommendationsDto = {
        objective: ObjectiveType.FOCUS,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.HIGH,
      };

      const getRecommendationsMock = jest
        .spyOn(service, 'getRecommendations')
        .mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getRecommendations(mockRequest, dto);

      expect(result).toEqual(mockRecommendationResponse);
      expect(getRecommendationsMock).toHaveBeenCalledWith('user123', dto);
    });

    it('should call service with correct userId from request', async () => {
      const dto: GetRecommendationsDto = {
        objective: ObjectiveType.WORKOUT,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.HIGH,
      };

      const getRecommendationsMock = jest
        .spyOn(service, 'getRecommendations')
        .mockResolvedValue(mockRecommendationResponse);

      await controller.getRecommendations(mockRequest, dto);

      expect(getRecommendationsMock).toHaveBeenCalledWith(
        'user123',
        expect.any(Object),
      );
    });

    it('should handle service errors', async () => {
      const dto: GetRecommendationsDto = {
        objective: ObjectiveType.FOCUS,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.HIGH,
      };

      const error = new Error('Service error');
      jest.spyOn(service, 'getRecommendations').mockRejectedValue(error);

      await expect(
        controller.getRecommendations(mockRequest, dto),
      ).rejects.toThrow('Service error');
    });

    it('should return recommendations with correct structure', async () => {
      const dto: GetRecommendationsDto = {
        objective: ObjectiveType.FOCUS,
        mood: MoodType.HAPPY,
        energyLevel: EnergyLevelType.HIGH,
      };

      jest
        .spyOn(service, 'getRecommendations')
        .mockResolvedValue(mockRecommendationResponse);

      const result = await controller.getRecommendations(mockRequest, dto);

      expect(result).toHaveProperty('playlistId');
      expect(result).toHaveProperty('tracks');
      expect(result.tracks).toBeInstanceOf(Array);
    });
  });
});
