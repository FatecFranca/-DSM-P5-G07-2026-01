import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // RNF-S02: Pipe global de sanitização
  app.useGlobalPipes(
    new SanitizationPipe(),
    // Validação de DTOs com class-validator
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MusicSelector API')
    .setDescription(
      'API de recomendação musical com IA - Sistema multiplataforma de recomendação musical com classificação por estado emocional e contexto situacional',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Autenticação e Login')
    .addTag('Users', 'Gerenciamento de Usuários')
    .addTag('Recommendations', 'Recomendações de Músicas')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ Server running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
