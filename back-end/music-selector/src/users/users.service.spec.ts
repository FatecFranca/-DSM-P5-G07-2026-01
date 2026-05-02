import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockUser = {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    dateOfBirth: new Date('2000-01-01'),
    password: 'hashedPassword123',
    onboardingDone: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            feedback: {
              deleteMany: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            hashPassword: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        emailConfirmation: 'newuser@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        dateOfBirth: '2000-01-01',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(authService, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser as any);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(prismaService.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.login(
        'test@example.com',
        'password123',
      );

      expect(result).toBeDefined();
      expect(prismaService.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should delete user by id', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prismaService.feedback, 'updateMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser as any);

      const result = await service.deleteAccount('user123');

      expect(result).toBeDefined();
      expect(result.message).toContain('deletada');
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(prismaService.user.delete).toHaveBeenCalled();
    });
  });
});

