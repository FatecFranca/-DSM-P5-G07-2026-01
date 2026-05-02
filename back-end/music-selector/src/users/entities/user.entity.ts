// RN01, RN02, RN04, RN06, RN26: Entidade de usuário com validações de negócio
export class User {
  id!: string;
  // RN02: Campos obrigatórios
  name!: string;
  email!: string; // RN26: Imutável após criação
  dateOfBirth!: Date; // RN06, RN26: Imutável após criação
  password!: string; // RN03: Hash com salt (BCrypt)
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date; // RN29-30: Soft delete para anonimização
  isActive: boolean = true;
  
  // RN10-13: Dados de onboarding inteligente
  favoriteGenres: string[] = []; // 1-5 gêneros (mapeados com track_genre)
  audioPreference: 'instrumental' | 'mixed' | 'vocal' = 'mixed'; // RN12
  onboardingCompleted: boolean = false; // RN10: Indica se completou primeira vez
  
  // Auditoria
  lastLoginAt?: Date;
  failedLoginAttempts: number = 0; // Para RNF-S04: Rate limiting
  lastFailedLoginAt?: Date;
}
