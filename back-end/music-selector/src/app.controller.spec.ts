import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should have AppService injected', () => {
      expect(appService).toBeDefined();
    });

    it('should have getHello method', () => {
      expect(appController.getHello).toBeDefined();
      expect(typeof appController.getHello).toBe('function');
    });
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });

    it('should call AppService.getHello', () => {
      appController.getHello();
      expect(appService.getHello).toHaveBeenCalled();
    });

    it('should call service exactly once', () => {
      appController.getHello();
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('should return expected greeting message', () => {
      const result = appController.getHello();
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });
  });
});

