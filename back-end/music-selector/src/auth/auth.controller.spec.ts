import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockSignInResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthService injected', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      jest.spyOn(service, 'signIn').mockResolvedValue(mockSignInResponse);

      const result = await controller.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockSignInResponse);
      expect(service.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'signIn').mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(
        controller.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should call signIn with correct email and password', async () => {
      jest.spyOn(service, 'signIn').mockResolvedValue(mockSignInResponse);

      await controller.login({
        email: 'user@example.com',
        password: 'securePass123',
      });

      expect(service.signIn).toHaveBeenCalledWith('user@example.com', 'securePass123');
      expect(service.signIn).toHaveBeenCalledTimes(1);
    });
  });
});
