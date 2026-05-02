import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let authService: AuthService;

  const mockUserResponse = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    birthDate: new Date('2000-01-01'),
    onboardingDone: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            completeOnboarding: jest.fn(),
            update: jest.fn(),
            deleteAccount: jest.fn(),
            logout: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        emailConfirmation: 'test@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        dateOfBirth: '2000-01-01',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUserResponse as any);

      const result = await controller.register(createUserDto);

      expect(result).toEqual(mockUserResponse);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = { access_token: 'token123' };
      jest.spyOn(authService, 'signIn').mockResolvedValue(loginResponse as any);

      const result = await controller.login(credentials);

      expect(result).toEqual(loginResponse);
      expect(authService.signIn).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
    });
  });

  describe('completeOnboarding', () => {
    it('should complete user onboarding', async () => {
      const onboardingDto = {
        favoriteGenres: ['rock', 'pop'],
        audioPreference: 'VOCAL',
      };

      const expectedResponse = { ...mockUserResponse, onboardingDone: true };
      jest
        .spyOn(service, 'completeOnboarding')
        .mockResolvedValue(expectedResponse as any);

      const result = await controller.completeOnboarding(
        'user123',
        onboardingDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(service.completeOnboarding).toHaveBeenCalledWith(
        'user123',
        onboardingDto.favoriteGenres,
        onboardingDto.audioPreference,
      );
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated User',
      };

      const expectedResponse = { ...mockUserResponse, name: 'Updated User' };
      jest.spyOn(service, 'update').mockResolvedValue(expectedResponse as any);

      const result = await controller.update('user123', updateUserDto);

      expect(result).toEqual(expectedResponse);
      expect(service.update).toHaveBeenCalledWith('user123', updateUserDto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const deleteResponse = { message: 'Account deleted' };
      jest
        .spyOn(service, 'deleteAccount')
        .mockResolvedValue(deleteResponse as any);

      const result = await controller.deleteAccount('user123');

      expect(result).toEqual(deleteResponse);
      expect(service.deleteAccount).toHaveBeenCalledWith('user123');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const logoutResponse = { message: 'Logout successful' };
      jest.spyOn(service, 'logout').mockReturnValue(logoutResponse as any);

      const result = await controller.logout();

      expect(result).toEqual(logoutResponse);
      expect(service.logout).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const users = [mockUserResponse, { ...mockUserResponse, id: 'user456' }];
      jest.spyOn(service, 'findAll').mockReturnValue(users as any);

      const result = controller.findAll();

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockUserResponse as any);

      const result = await controller.findOne('user123');

      expect(result).toEqual(mockUserResponse);
      expect(service.findById).toHaveBeenCalledWith('user123');
    });
  });

  describe('remove', () => {
    it('should remove a user', () => {
      const removeResponse = { message: 'User removed' };
      jest.spyOn(service, 'remove').mockReturnValue(removeResponse as any);

      const result = controller.remove('user123');

      expect(result).toEqual(removeResponse);
      expect(service.remove).toHaveBeenCalledWith('user123');
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      const resetResponse = { message: 'Reset link sent' };
      jest
        .spyOn(service, 'requestPasswordReset')
        .mockResolvedValue(resetResponse as any);

      const result = await controller.forgotPassword({ email: 'test@example.com' });

      expect(result).toEqual(resetResponse);
      expect(service.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const resetBody = {
        token: 'reset-token-123',
        password: 'newPassword123',
        passwordConfirmation: 'newPassword123',
      };

      const resetResponse = { message: 'Password reset successfully' };
      jest
        .spyOn(service, 'resetPassword')
        .mockResolvedValue(resetResponse as any);

      const result = await controller.resetPassword(resetBody);

      expect(result).toEqual(resetResponse);
      expect(service.resetPassword).toHaveBeenCalledWith(
        resetBody.token,
        resetBody.password,
        resetBody.passwordConfirmation,
      );
    });
  });
});

