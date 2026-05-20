import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'RN01-RN06: Cria novo usuário com validações de email, senha e idade. Email deve ser único, senha 8+ chars, idade 13+ anos',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 'uuid',
        name: 'João Silva',
        email: 'joao@example.com',
        message: 'Usuário criado com sucesso. Complete o onboarding.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login de usuário',
    description: 'RN07-RN09: Autentica usuário e retorna JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido',
    schema: {
      example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() credentials: { email: string; password: string }) {
    return this.authService.signIn(credentials.email, credentials.password);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Solicitar reset de senha',
    description: 'RN08: Gera token temporário e envia link de reset por email. Não revela se email existe (segurança).',
  })
  @ApiResponse({
    status: 200,
    description: 'Se o email existir, um link foi enviado',
    schema: {
      example: { message: 'Se o email existir, um link de reset foi enviado' },
    },
  })
  @ApiResponse({ status: 400, description: 'Email inválido' })
  async forgotPassword(@Body() dto: RequestPasswordResetDto) {
    return this.usersService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Resetar senha',
    description: 'RNF-S03: Valida token de reset enviado por email e atualiza senha com novo hash BCrypt. Token expira em 1 hora.',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha resetada com sucesso',
    schema: {
      example: { message: 'Senha resetada com sucesso. Faça login com sua nova senha.' },
    },
  })
  @ApiResponse({ status: 400, description: 'Token inválido, expirado ou senhas não correspondem' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto.token, dto.password, dto.passwordConfirmation);
  }

  @Post(':id/onboarding')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Completar onboarding',
    description: 'RN10-RN13: Wizard de 3 passos (gêneros, estilo escuta, pref vocal/instrumental). Obrigatório na primeira vez',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completado',
  })
  async completeOnboarding(
    @Param('id') userId: string,
    @Body() body: CompleteOnboardingDto,
  ) {
    return this.usersService.completeOnboarding(
      userId,
      body.favoriteGenres,
      body.audioPreference,
    );
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Atualizar perfil do usuário',
    description: 'Permite editar dados do perfil do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Deletar conta (soft delete)',
    description: 'RN29-RN30: LGPD - Deleta conta e anonimiza histórico de feedback',
  })
  @ApiResponse({
    status: 200,
    description: 'Conta deletada',
  })
  async deleteAccount(@Param('id') id: string) {
    return this.usersService.deleteAccount(id);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout',
    description: 'Encerra a sessão do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout bem-sucedido',
  })
  async logout() {
    return this.usersService.logout();
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna lista de todos os usuários (apenas desenvolvimento)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    isArray: true,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Obter dados do usuário',
    description: 'Retorna informações de um usuário específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Delete(':id/hard')
  @HttpCode(200)
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Deletar conta permanentemente (hard delete)',
    description: 'Remove completamente o usuário e todos os dados',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário permanentemente deletado',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
