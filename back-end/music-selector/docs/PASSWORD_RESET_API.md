# 📧 API de Reset de Senha - Documentação

## 🔄 Fluxo Completo

### 1️⃣ Usuário Solicita Reset (Forgot Password)

**Endpoint**: `POST /users/forgot-password`

```bash
curl -X POST http://localhost:3000/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com"
  }'
```

**Resposta (200 OK)**:
```json
{
  "message": "Se o email existir, um link de reset foi enviado"
}
```

**O que acontece internamente:**
- ✅ Valida se o email existe no banco
- ✅ Gera token aleatório seguro (32 bytes = 64 caracteres hex)
- ✅ Hasheia o token com BCrypt (RNF-S03)
- ✅ Salva no banco com expiração de 1 hora
- 📧 Envia email com link (atualmente simulado)
- 🔒 Não revela se email existe (segurança - RN08)

---

### 2️⃣ Usuário Clica no Link do Email

O email contém um link como:
```
http://localhost:3000/reset-password?token=abc123def456...
```

**Frontend**:
- Extrai o token da URL
- Exibe formulário para nova senha

---

### 3️⃣ Usuário Envia Nova Senha

**Endpoint**: `POST /users/reset-password`

```bash
curl -X POST http://localhost:3000/users/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "password": "NovaSenha123",
    "passwordConfirmation": "NovaSenha123"
  }'
```

**Resposta (200 OK)**:
```json
{
  "message": "Senha resetada com sucesso. Faça login com sua nova senha."
}
```

**Validações** (RNF-S03):
- ✅ Token deve existir e não estar expirado (1 hora)
- ✅ Token não pode ter sido usado antes
- ✅ Senha deve ter 8+ caracteres
- ✅ Senha deve conter letra + número
- ✅ Confirmação deve corresponder

**O que acontece internamente:**
- ✅ Busca todos os tokens não expirados
- ✅ Compara token com hash usando BCrypt
- ✅ Encontra usuário pelo email
- ✅ Hasheia nova senha com BCrypt
- ✅ Atualiza `password_hash` na tabela `users`
- ✅ Marca token como "usado" (auditoria LGPD)
- 📧 Envia email de confirmação
- 🔐 Usuário pode fazer login com nova senha

---

## 🛡️ Recursos de Segurança

### RN08 - Não Revela Email Existente
```
POST /users/forgot-password → sempre retorna "Se o email existir..."
Impede enumeração de usuários válidos
```

### RNF-S03 - Criptografia
- Tokens: Hash com BCrypt (10 rounds)
- Senhas: Hash com BCrypt (10 rounds)
- Nenhuma senha/token em texto puro

### Expiração
- Token expira em **1 hora**
- Tokens expirados são ignorados
- Job de limpeza pode remover tokens antigos

### Auditoria LGPD
- Campo `used_at` registra quando token foi utilizado
- Campo `created_at` registra criação
- Possibilita rastreabilidade

---

## 🗄️ Schema do Banco

### Tabela: `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id STRING PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token STRING UNIQUE NOT NULL,      -- Hash do token
  expires_at TIMESTAMP NOT NULL,      -- Expiração (1 hora)
  used_at TIMESTAMP NULL,             -- Quando foi usado (auditoria)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email ON password_reset_tokens(email);
CREATE INDEX idx_expires_at ON password_reset_tokens(expires_at);
```

---

## 🧹 Manutenção

### Limpar Tokens Expirados

```typescript
// Pode ser chamado via job/scheduler
await usersService.cleanExpiredResetTokens();
```

---

## 📋 Exemplos de Erro

### Token Inválido
```bash
curl -X POST http://localhost:3000/users/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token_invalido",
    "password": "NovaSenha123",
    "passwordConfirmation": "NovaSenha123"
  }'
```

**Resposta (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Token de reset inválido ou expirado"
}
```

### Senhas Não Correspondem
```json
{
  "statusCode": 400,
  "message": "Senhas não correspondem"
}
```

### Senha Fraca
```json
{
  "statusCode": 400,
  "message": "Senha deve conter pelo menos um número"
}
```

---

## 🚀 Próximos Passos

### ✅ Integração de Email (IMPLEMENTADO)

`EmailService` implementado com Nodemailer + SMTP configurável:

**Recursos:**
- Template HTML com branding Music Selector
- Segurança: Link com token seguro (32 bytes)
- Confirmação de sucesso pós-reset
- Tratamento robusto de erros com logging

**Configuração via .env:**
```env
EMAIL_HOST=seu-smtp-host
EMAIL_PORT=587
EMAIL_USER=seu-email@exemplo.com
EMAIL_PASSWORD=sua-senha
EMAIL_FROM=noreply@musicselector.com
```

**Exemplo SendGrid (alternativa):**
```typescript
// Para usar SendGrid em produção:
import * as sgMail from '@sendgrid/mail';

async sendPasswordResetEmail(email: string, resetLink: string) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Resetar Senha - Music Selector',
    html: `<a href="${resetLink}">Clique aqui para resetar</a>`
  };
  await sgMail.send(msg);
}
```

### ✅ Job Scheduler (IMPLEMENTADO)

Implementado `CleanupTokensJob` com 2 cronjobs automáticos:

**1. Limpeza Básica (02:00 - Diário)**
```typescript
// Deleta todos os tokens com expiresAt < agora
@Cron('0 2 * * *')
async cleanExpiredResetTokens()
```

**2. Limpeza Profunda (03:00 - Domingos)**
```typescript
// Mantém apenas tokens usados dos últimos 7 dias (auditoria LGPD)
@Cron('0 3 * * 0')
async cleanOldUsedTokens()
```
import { UsersService } from '../users/users.service';

@Injectable()
export class CleanupTokensJob {
  constructor(private usersService: UsersService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    const result = await this.usersService.cleanExpiredResetTokens();
    console.log(`🧹 Tokens expirados removidos: ${result.deletedCount}`);
  }
}
```

---

## ✅ Checklist de Implementação

- [x] Modelo `PasswordResetToken` no Prisma
- [x] Migration criada e aplicada
- [x] DTOs de validação (RequestPasswordResetDto, ResetPasswordDto)
- [x] EmailService (simulado, pronto para integração)
- [x] UsersService com métodos de reset
- [x] Endpoints do controller
- [x] Tipagem TypeScript completa
- [ ] Integração com SendGrid/Mailgun
- [ ] Job de limpeza de tokens expirados
- [ ] Testes unitários
- [ ] Testes E2E

---

## 📞 Referência Rápida

| Operação | Endpoint | Método | Auth |
|----------|----------|--------|------|
| Solicitar Reset | `/users/forgot-password` | POST | ❌ |
| Resetar Senha | `/users/reset-password` | POST | ❌ |
| Login | `/users/login` | POST | ❌ |

---

**Última atualização**: 20/05/2026
