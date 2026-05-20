import { Injectable, Logger } from '@nestjs/common';

/**
 * RN08: Serviço de email para notificações
 * Configurado para SendGrid, Mailgun ou serviço local
 * Por enquanto usa logger (simulado)
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Enviar email de reset de senha
   * @param email Destinatário
   * @param resetLink Link com token para reset
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      // TODO: Integrar com SendGrid, Mailgun ou serviço SMTP
      // Por enquanto, apenas log
      this.logger.log(
        `📧 Email de reset enviado para: ${email}\n` +
        `Link: ${resetLink}\n` +
        `Nota: Em produção, usar SendGrid/Mailgun`
      );

      // Exemplo de estrutura para SendGrid:
      /*
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM || 'noreply@musicselector.com',
        subject: 'Resetar sua Senha - Music Selector',
        html: `
          <h2>Resetar Senha</h2>
          <p>Você solicitou um reset de senha. Clique no link abaixo para continuar:</p>
          <a href="${resetLink}">Resetar Senha</a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou isto, ignore este email.</p>
        `,
      };
      await sgMail.send(msg);
      */
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${email}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmação após reset bem-sucedido
   */
  async sendPasswordResetConfirmation(email: string): Promise<void> {
    try {
      this.logger.log(
        `✅ Confirmar email enviado para: ${email}\n` +
        `Nota: Sua senha foi alterada com sucesso`
      );
      // TODO: Implementar email de confirmação
    } catch (error) {
      this.logger.error(`Erro ao enviar confirmação para ${email}:`, error);
      throw error;
    }
  }
}
