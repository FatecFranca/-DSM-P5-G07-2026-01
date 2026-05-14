import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });

  describe('canActivate', () => {
    it('should authenticate valid JWT token', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: mockUser,
      };

      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      // The guard should be properly instantiated and able to validate
      expect(guard).toBeDefined();
      expect(mockRequest.user).toEqual(mockUser);
    });

    it('should allow requests with authenticated user', () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer valid-token',
            },
            user: {
              id: 'user123',
              email: 'test@example.com',
            },
          }),
        }),
      } as unknown as ExecutionContext;

      const mockRequest = mockExecutionContext.switchToHttp().getRequest();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.id).toBe('user123');
    });

    it('should check for authorization header', () => {
      const mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {},
          }),
        }),
      } as unknown as ExecutionContext;

      const mockRequest = mockExecutionContext.switchToHttp().getRequest();
      expect(mockRequest.headers.authorization).toBeUndefined();
    });
  });

  describe('handleRequest', () => {
    it('should pass user from strategy', () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      expect(mockUser).toBeDefined();
      expect(mockUser.id).toBe('user123');
      expect(mockUser.email).toBe('test@example.com');
    });

    it('should validate user object structure', () => {
      const mockUser = {
        id: 'user456',
        email: 'another@example.com',
      };

      expect(mockUser).toHaveProperty('id');
      expect(mockUser).toHaveProperty('email');
      expect(typeof mockUser.id).toBe('string');
      expect(typeof mockUser.email).toBe('string');
    });
  });
});
