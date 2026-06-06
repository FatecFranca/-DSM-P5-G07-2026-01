import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'localhost',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: process.env.EMAIL_USER
        ? {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          }
        : undefined,
    });

    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão SMTP verificada com sucesso');
    } catch {
      this.logger.warn(
        'Não foi possível verificar a conexão SMTP. Verifique EMAIL_HOST, EMAIL_PORT, EMAIL_USER e EMAIL_PASSWORD.',
      );
    }
  }

  async sendPasswordResetEmail(email: string, resetCode: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@vibeai.com',
        to: email,
        subject: 'Redefinir sua senha - VibeAI',
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0B0F1A;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #121A2A;
                padding: 40px;
                border-radius: 18px;
                color: #FFFFFF;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #7C3AED;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #FFFFFF;
                margin: 0;
                font-size: 30px;
              }
              h2 {
                color: #FFFFFF;
                font-size: 22px;
                margin-top: 0;
              }
              p {
                color: #A7B0C0;
                line-height: 1.6;
                font-size: 16px;
              }
              .code {
                display: inline-block;
                padding: 16px 28px;
                background: linear-gradient(90deg, #7C3AED, #22D3EE);
                color: #FFFFFF;
                border-radius: 14px;
                letter-spacing: 8px;
                font-size: 32px;
                font-weight: 800;
                margin: 18px 0;
              }
              .warning {
                background-color: rgba(245, 158, 11, 0.12);
                border-left: 4px solid #F59E0B;
                padding: 15px;
                margin: 20px 0;
                border-radius: 8px;
                color: #FDE68A;
              }
              .footer {
                border-top: 1px solid rgba(255,255,255,0.10);
                margin-top: 30px;
                padding-top: 20px;
                font-size: 12px;
                color: #A7B0C0;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>VibeAI</h1>
              </div>

              <h2>Redefinir sua senha</h2>
              <p>Você solicitou a redefinição da sua senha. Use o código abaixo no app VibeAI:</p>

              <center>
                <div class="code">${resetCode}</div>
              </center>

              <div class="warning">
                <strong>Atenção:</strong> este código expira em 1 hora. Se você não solicitou uma redefinição de senha, ignore este email.
              </div>

              <p>Digite esse código no campo de recuperação de senha do aplicativo e cadastre sua nova senha.</p>

              <div class="footer">
                <p>© 2026 VibeAI - Sistema de Recomendação Musical</p>
                <p>Este é um email automático. Por favor, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Redefinir senha - VibeAI\n\nVocê solicitou a redefinição da sua senha.\n\nCódigo: ${resetCode}\n\nEste código expira em 1 hora.`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de reset enviado para: ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email de reset para ${email}:`, error);
      throw error;
    }
  }

  async sendPasswordResetConfirmation(email: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@vibeai.com',
        to: email,
        subject: 'Senha alterada com sucesso - VibeAI',
        html: `
          <!DOCTYPE html>
          <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0B0F1A;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background: #121A2A;
                padding: 40px;
                border-radius: 18px;
                color: #FFFFFF;
              }
              .header {
                text-align: center;
                border-bottom: 3px solid #7C3AED;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #FFFFFF;
                margin: 0;
                font-size: 30px;
              }
              .success-box {
                background: rgba(34, 197, 94, 0.14);
                border: 2px solid #22C55E;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
              }
              .success-box h2 {
                color: #FFFFFF;
                margin: 0;
              }
              p {
                color: #A7B0C0;
                line-height: 1.6;
                font-size: 16px;
              }
              .highlight {
                color: #22D3EE;
                font-weight: bold;
              }
              .footer {
                border-top: 1px solid rgba(255,255,255,0.10);
                margin-top: 30px;
                padding-top: 20px;
                font-size: 12px;
                color: #A7B0C0;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>VibeAI</h1>
              </div>

              <div class="success-box">
                <h2>Senha alterada com sucesso!</h2>
              </div>

              <p>Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.</p>
              <p class="highlight">Bem-vindo de volta ao VibeAI.</p>
              <p><strong>Segurança:</strong> se você não realizou essa ação, entre em contato com o suporte imediatamente.</p>

              <div class="footer">
                <p>© 2026 VibeAI - Sistema de Recomendação Musical</p>
                <p>Este é um email automático. Por favor, não responda.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Sua senha foi alterada com sucesso!\n\nAgora você pode fazer login com sua nova senha.\n\nSe você não realizou essa ação, entre em contato conosco imediatamente.`,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de confirmação enviado para: ${email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email de confirmação para ${email}:`, error);
      throw error;
    }
  }
}
