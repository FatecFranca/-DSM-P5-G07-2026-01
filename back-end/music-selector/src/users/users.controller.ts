import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: '📝 Registrar novo usuário',
    description: 'RN01-RN06: Cria usuário com validações (email único, senha 8+ chars, idade 13+). RNF-S01: Sanitização. RNF-S03: BCrypt',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso - Onboarding obrigatório',
    schema: {
      example: {
        id: 'uuid-123',
        name: 'João Silva',
        email: 'joao@example.com',
        message: '✅ Usuário criado com sucesso. Complete o onboarding (RN10).',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos (email/senha/idade)' })
  @ApiResponse({ status: 409, description: '❌ Email já cadastrado (RN02)' })
  @ApiResponse({ status: 422, description: 'Validação falhou (idade < 13)' })
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`📝 Registro iniciado: ${createUserDto.email}`);
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: '🔑 Login de usuário',
    description: 'RN07-RN09: Autentica e retorna JWT token. Valida email/senha com BCrypt (RNF-S03). Requer onboarding completo (RN10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido - JWT retornado',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid-123',
          name: 'João Silva',
          email: 'joao@example.com',
          onboardingDone: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ Email ou senha inválidos' })
  @ApiResponse({ status: 400, description: '❌ Complete o onboarding primeiro (RN10)' })
  async login(@Body() credentials: { email: string; password: string }) {
    this.logger.log(`🔑 Login attempt: ${credentials.email}`);
    return this.authService.signIn(credentials.email, credentials.password);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: '🔐 Solicitar reset de senha',
    description: 'RN08: Gera token seguro (32 bytes, 1h expiração). Não revela se email existe (segurança). Email via Nodemailer/SendGrid',
  })
  @ApiResponse({
    status: 200,
    description: 'Link enviado (se email existe) - mensagem genérica por segurança',
    schema: {
      example: {
        message: 'Se o email existir, um link de reset foi enviado para o seu email',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  async forgotPassword(@Body() dto: RequestPasswordResetDto) {
    this.logger.log(`🔐 Forgot password request: ${dto.email}`);
    return this.usersService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: '🔑 Resetar senha',
    description: 'RNF-S03: Valida token (BCrypt), hash nova senha, marca token como usado (LGPD), envia confirmação por email',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha resetada com sucesso - Email de confirmação enviado',
    schema: {
      example: {
        message: '✅ Senha resetada com sucesso. Faça login com sua nova senha.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '❌ Token inválido/expirado ou senhas não correspondem' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    this.logger.log(`🔑 Password reset attempt with token`);
    return this.usersService.resetPassword(dto.token, dto.password, dto.passwordConfirmation);
  }

  @Post(':id/onboarding')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: '🎸 Completar Onboarding',
    description: 'RN10-RN13: Wizard 3 passos (1-5 gêneros, estilo escuta, pref vocal/instrumental). Obrigatório antes de usar app. Cold Start mitigation',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completado - Pronto para usar recomendações',
    schema: {
      example: {
        message: '✅ Onboarding completado com sucesso',
        userId: 'uuid-123',
        favoriteGenres: ['rock', 'indie', 'pop'],
        audioPreference: 'mixed',
      },
    },
  })
  @ApiResponse({ status: 400, description: '❌ Gêneros inválidos ou audioPreference fora do padrão' })
  @ApiResponse({ status: 401, description: '❌ JWT inválido' })
  async completeOnboarding(
    @Param('id') userId: string,
    @Body() body: CompleteOnboardingDto,
  ) {
    this.logger.log(`🎸 Onboarding completion: ${userId}`);
    return this.usersService.completeOnboarding(
      userId,
      body.favoriteGenres,
      body.audioPreference,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: '✏️ Atualizar perfil',
    description: 'RN26-RN28: Edita nome, senha (RNF-S03: BCrypt), gêneros, audioPreference. Dispara recalcimento de vibes (RN28)',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    schema: {
      example: {
        message: '✅ Perfil atualizado com sucesso',
        user: {
          id: 'uuid-123',
          name: 'João Silva Updated',
          favoriteGenres: ['rock', 'indie'],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '❌ Dados inválidos' })
  @ApiResponse({ status: 401, description: '❌ JWT inválido' })
  @ApiResponse({ status: 404, description: '❌ Usuário não encontrado' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`✏️ Profile update: ${id}`);
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: '🗑️ Deletar conta (soft delete)',
    description: 'RN29-RN30: LGPD - Soft delete (inativa conta). Anonimiza histórico feedback (userId=null). Reverter possível',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta deletada com sucesso (soft delete)',
    schema: {
      example: {
        message: '✅ Conta deletada com sucesso. Seus dados foram anonimizados.',
        deletedAt: '2026-05-22T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ JWT inválido' })
  @ApiResponse({ status: 404, description: '❌ Usuário não encontrado' })
  async deleteAccount(@Param('id') id: string) {
    this.logger.log(`🗑️ Soft delete account: ${id}`);
    return this.usersService.deleteAccount(id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: '👋 Logout',
    description: 'RN31: Encerra sessão (JWT stateless). Pode implementar blacklist se necessário',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout bem-sucedido',
    schema: {
      example: {
        message: '✅ Logout realizado com sucesso. JWT invalidado',
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ JWT inválido' })
  async logout() {
    this.logger.log(`👋 Logout request`);
    return this.usersService.logout();
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: '📋 Listar todos os usuários',
    description: 'Retorna lista de todos os usuários (admin only). Útil para auditoria e analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada',
    isArray: true,
    schema: {
      example: [
        {
          id: 'uuid-123',
          name: 'João Silva',
          email: 'joao@example.com',
          onboardingDone: true,
          createdAt: '2026-05-20T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ Não autenticado',
  })
  @ApiResponse({
    status: 403,
    description: '❌ Permissão negada: apenas admin pode acessar',
  })
  findAll() {
    this.logger.log(`📋 Admin listing all users`);
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: '👤 Obter dados do usuário',
    description: 'Retorna perfil do usuário (nome, email, onboarding, gêneros, pref áudio)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados',
    schema: {
      example: {
        id: 'uuid-123',
        name: 'João Silva',
        email: 'joao@example.com',
        onboardingDone: true,
        favoriteGenres: ['rock', 'indie'],
        audioPreference: 'mixed',
        createdAt: '2026-05-20T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ JWT inválido' })
  @ApiResponse({ status: 404, description: '❌ Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`👤 Get user profile: ${id}`);
    return this.usersService.findById(id);
  }

  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: '🔥 Hard Delete (Admin Only)',
    description: 'Remove completamente usuário e TODOS os dados (não reversível). Admin only para auditoria. RN30',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário permanentemente deletado',
    schema: {
      example: {
        message: '✅ Usuário e todos os dados permanentemente removidos',
        deletedAt: '2026-05-22T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: '❌ JWT inválido' })
  @ApiResponse({ status: 403, description: '❌ Permissão negada: apenas admin' })
  @ApiResponse({ status: 404, description: '❌ Usuário não encontrado' })
  remove(@Param('id') id: string) {
    this.logger.log(`🔥 Hard delete request: ${id}`);
    return this.usersService.remove(id);
  }
}
