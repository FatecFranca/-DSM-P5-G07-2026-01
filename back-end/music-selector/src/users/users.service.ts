import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * RN01-RN06: Criar novo usuário com validações
   * Registra usuário com hash de senha (RNF-S03)
   */
  async create(dto: CreateUserDto) {
    try {
      // RN01: Verificar email único
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }

      // RNF-S03: Hash da senha com BCrypt
      const passwordHash = await bcrypt.hash(dto.password, 10);

      // Criar usuário
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          birthDate: new Date(dto.dateOfBirth),
          passwordHash,
          onboardingDone: false,
        },
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        message: 'Usuário criado com sucesso. Complete o onboarding.',
      };
    } catch (error: any) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  /**
   * RN07-RN09: Autenticar usuário
   * Movido para AuthService para usar BCrypt
   */
  async login(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Email ou senha inválidos');
    }
    // Autenticação feita em AuthService.signIn()
    return { message: 'Login realizado com sucesso' };
  }

  /**
   * RN08: Solicitar reset de senha
   * Validar email antes de enviar link
   */
  async requestPasswordReset(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      // Não revelar se email existe ou não (segurança)
      return { message: 'Se o email existe, um link foi enviado' };
    }
    // TODO: Implementar geração de token temporário e envio de email
    return { message: 'Link de reset enviado para o email' };
  }

  /**
   * RNF-S03: Reset de senha com hash
   */
  async resetPassword(token: string, password: string, passwordConfirmation: string) {
    // TODO: Validar token e sua expiração
    // Por agora apenas simulado
    if (password !== passwordConfirmation) {
      throw new BadRequestException('Senhas não correspondem');
    }
    return { message: 'Senha resetada com sucesso' };
  }

  /**
   * RN10-RN13: Completar onboarding
   */
  async completeOnboarding(
    userId: string,
    favoriteGenres: string[],
    audioPreference: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      // Atualizar status de onboarding
      await this.prisma.user.update({
        where: { id: userId },
        data: { onboardingDone: true },
      });

      // Criar/atualizar perfil de onboarding
      const normalizedPreference = this.normalizeAudioPreference(audioPreference);
      await this.prisma.onboardingProfile.upsert({
        where: { userId },
        create: {
          userId,
          audioPreference: normalizedPreference as any,
        },
        update: {
          audioPreference: normalizedPreference as any,
        },
      });

      // Associar gêneros favoritos
      if (favoriteGenres && favoriteGenres.length > 0) {
        // RN11: Validar 1-5 gêneros
        if (favoriteGenres.length < 1 || favoriteGenres.length > 5) {
          throw new BadRequestException('Selecione entre 1 e 5 gêneros');
        }

        // Limpar gêneros antigos
        await this.prisma.userGenre.deleteMany({
          where: { userId },
        });

        // Adicionar novos gêneros
        for (const genreId of favoriteGenres) {
          await this.prisma.userGenre.create({
            data: {
              userId,
              genreId,
            },
          });
        }
      }

      return {
        message: 'Onboarding completado com sucesso',
        userId,
      };
    } catch (error: any) {
      throw new InternalServerErrorException('Erro ao completar onboarding');
    }
  }

  /**
   * RN26: Atualizar perfil do usuário
   * Apenas nome e senha são editáveis
   */
  async update(id: string, dto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      const updateData: any = {};

      // RN26: Atualizar nome se fornecido
      if (dto.name) {
        updateData.name = dto.name;
      }

      // RN26: Atualizar senha se fornecida (com hash)
      if (dto.password) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        updateData.passwordHash = passwordHash;
      }

      // RN27: Atualizar preferências de onboarding se fornecidas
      if (dto.audioPreference) {
        const normalizedPreference = this.normalizeAudioPreference(
          dto.audioPreference,
        );
        await this.prisma.onboardingProfile.upsert({
          where: { userId: id },
          create: {
            userId: id,
            audioPreference: normalizedPreference as any,
          },
          update: {
            audioPreference: normalizedPreference as any,
          },
        });
      }

      if (dto.favoriteGenres) {
        // RN11: Validar 1-5 gêneros
        const genreCount = dto.favoriteGenres.split(',').length;
        if (genreCount < 1 || genreCount > 5) {
          throw new BadRequestException('Selecione entre 1 e 5 gêneros');
        }

        // Atualizar gêneros
        await this.prisma.userGenre.deleteMany({
          where: { userId: id },
        });

        for (const genreId of dto.favoriteGenres.split(',')) {
          await this.prisma.userGenre.create({
            data: {
              userId: id,
              genreId: genreId.trim(),
            },
          });
        }
      }

      // Atualizar usuário se houver mudanças
      if (Object.keys(updateData).length > 0) {
        await this.prisma.user.update({
          where: { id },
          data: updateData,
        });
      }

      // RN28: Recalcular vibes diárias quando gêneros mudam
      // TODO: Disparar job de recalcular Vibes

      return {
        message: 'Perfil atualizado com sucesso',
        userId: id,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar perfil');
    }
  }

  /**
   * RN29-RN30: Deletar conta (soft delete com anonimização)
   * LGPD: Anonimizar dados pessoais mas manter feedback
   */
  async deleteAccount(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      // RN30: Anonimizar dados sensíveis
      // Desassociar feedbacks do usuário (deixar userId null)
      await this.prisma.feedback.updateMany({
        where: { userId: id },
        data: { userId: null },
      });

      // RN29: Deletar conta (soft delete)
      await this.prisma.user.delete({
        where: { id },
      });

      return {
        message: 'Conta deletada permanentemente',
      };
    } catch (error: any) {
      throw new InternalServerErrorException('Erro ao deletar conta');
    }
  }

  /**
   * RN31: Logout (invalidar sessão JWT)
   * JWT é stateless, mas pode ser implementado com blacklist
   */
  logout() {
    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        onboardingDone: true,
      },
    });
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        onboardingDone: true,
      },
    });
  }

  /**
   * Listar todos os usuários (apenas admin)
   * TODO: Adicionar autenticação/autorização
   */
  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        onboardingDone: true,
        createdAt: true,
      },
    });
  }

  /**
   * Remover usuário de verdade (hard delete)
   * Apenas para admin/testes
   */
  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'Usuário removido permanentemente' };
  }

  private normalizeAudioPreference(value: string) {
    const normalized = value.trim().toUpperCase();
    if (normalized === 'INSTRUMENTAL' || normalized === 'MIXED' || normalized === 'VOCAL') {
      return normalized;
    }

    throw new BadRequestException('Preferência deve ser: instrumental, mixed ou vocal');
  }
}
