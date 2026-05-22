import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/**
 * RN08: Serviço de email para notificações
 * Implementado com Nodemailer para SMTP
 * Suporta variáveis de ambiente para configuração
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465', // true para porta 465, false para outras portas
      auth: process.env.EMAIL_USER
        ? {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          }
        : undefined,
    });

    // Verificar conexão do transporter
    this.verifyConnection();
  }

  /**
   * Verificar se a conexão SMTP está funcionando
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexão SMTP verificada com sucesso');
    } catch (error) {
      this.logger.warn(
        '⚠️ Aviso: Não foi possível verificar a conexão SMTP. ' +
          'Verifique as variáveis de ambiente EMAIL_HOST, EMAIL_PORT, EMAIL_USER e EMAIL_PASSWORD',
      );
    }
  }

  /**
   * Enviar email de reset de senha
   * @param email Destinatário
   * @param resetLink Link com token para reset
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@musicselector.com',
        to: email,
        subject: 'Resetar sua Senha - Music Selector 🎵',
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #1DB954;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #1DB954;
                margin: 0;
                font-size: 28px;
              }
              h2 {
                color: #333;
                font-size: 20px;
                margin-top: 0;
              }
              p {
                color: #666;
                line-height: 1.6;
                font-size: 16px;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background: #1DB954;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
                font-weight: bold;
                transition: background 0.3s;
              }
              .button:hover {
                background: #1ed760;
              }
              .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
                color: #856404;
              }
              .footer {
                border-top: 1px solid #eee;
                margin-top: 30px;
                padding-top: 20px;
                font-size: 12px;
                color: #999;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 Music Selector</h1>
              </div>
              
              <h2>Resetar sua Senha</h2>
              <p>Você solicitou um reset de senha. Clique no botão abaixo para continuar:</p>
              
              <center>
                <a href="${resetLink}" class="button">Resetar Senha</a>
              </center>
              
              <div class="warning">
                <strong>⏰ Atenção:</strong> Este link expira em 1 hora. Se você não solicitou um reset de senha, ignore este email ou entre em contato com o suporte.
              </div>
              
              <p>Ou copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 4px; color: #666; font-size: 14px;">
                ${resetLink}
              </p>
              
              <div class="footer">
                <p>© 2026 Music Selector - Sistema de Recomendação Musical</p>
                <p>Se você não realizou essa ação, por favor ignore este email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Resetar Senha\n\nVocê solicitou um reset de senha. Visite este link para continuar:\n${resetLink}\n\nEste link expira em 1 hora.`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email de reset enviado para: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar email de reset para ${email}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmação após reset bem-sucedido
   */
  async sendPasswordResetConfirmation(email: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@musicselector.com',
        to: email,
        subject: 'Senha Alterada com Sucesso - Music Selector 🎵',
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #1DB954;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #1DB954;
                margin: 0;
                font-size: 28px;
              }
              .success-box {
                background: #d4edda;
                border: 2px solid #28a745;
                border-radius: 4px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
              }
              .success-box h2 {
                color: #28a745;
                margin-top: 0;
              }
              h2 {
                color: #333;
                font-size: 20px;
              }
              p {
                color: #666;
                line-height: 1.6;
                font-size: 16px;
              }
              .highlight {
                color: #1DB954;
                font-weight: bold;
              }
              .footer {
                border-top: 1px solid #eee;
                margin-top: 30px;
                padding-top: 20px;
                font-size: 12px;
                color: #999;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 Music Selector</h1>
              </div>
              
              <div class="success-box">
                <h2>✅ Senha Alterada com Sucesso!</h2>
              </div>
              
              <p>Sua senha foi resetada com sucesso. Agora você pode fazer login com sua nova senha.</p>
              
              <p class="highlight">🎵 Bem-vindo de volta ao Music Selector!</p>
              
              <p><strong>Dica:</strong> Guarde sua nova senha em um local seguro. Nós nunca pediremos sua senha por email.</p>
              
              <p><strong>⚠️ Segurança:</strong> Se você não realizou essa ação, entre em contato com o suporte imediatamente para investigar possível acesso não autorizado.</p>
              
              <div class="footer">
                <p>© 2026 Music Selector - Sistema de Recomendação Musical</p>
                <p>Este é um email automático. Por favor, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Sua senha foi alterada com sucesso!\n\nAgora você pode fazer login com sua nova senha.\n\nSe você não realizou essa ação, entre em contato conosco imediatamente.`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email de confirmação enviado para: ${email}`);
    } catch (error) {
      this.logger.error(
        `❌ Erro ao enviar email de confirmação para ${email}:`,
        error,
      );
      throw error;
    }
  }
}
