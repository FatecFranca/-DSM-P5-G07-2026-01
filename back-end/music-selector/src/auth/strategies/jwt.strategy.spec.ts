import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from '../constants';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data with id and email', async () => {
      const payload = {
        sub: 'user123',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
      });
    });

    it('should extract sub as id', async () => {
      const payload = {
        sub: 'userId456',
        email: 'user@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result.id).toBe('userId456');
    });

    it('should extract email from payload', async () => {
      const payload = {
        sub: 'user789',
        email: 'newemail@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe('newemail@example.com');
    });

    it('should handle payload with additional properties', async () => {
      const payload = {
        sub: 'user999',
        email: 'user999@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user999',
        email: 'user999@example.com',
      });
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
    });
  });
});
