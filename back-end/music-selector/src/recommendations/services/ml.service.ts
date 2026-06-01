import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { MlFeatures } from './map-answers-to-ml-features';

/**
 * MLService: Comunicação com o microserviço Python/FastAPI
 * Responsável por chamar o modelo de ML para recomendações
 */
@Injectable()
export class MLService {
  private readonly logger = new Logger(MLService.name);
  private readonly ML_SERVICE_URL =
    process.env.ML_API_URL || process.env.ML_SERVICE_URL || 'http://localhost:8000';

  constructor(private httpService: HttpService) {}

  /**
   * Chamar serviço Python de ML para obter recomendações
   */
  async getRecommendations(payload: any) {
    try {
      const url = `${this.ML_SERVICE_URL}/predict-vibe`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          timeout: 30000,
        }),
      );
      return (response as any).data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao chamar ML Service (recommend): ${error?.message}`,
        error?.response?.data,
      );
      throw new InternalServerErrorException(
        'Erro ao gerar recomendações. Tente novamente mais tarde.',
      );
    }
  }

  /**
   * Chamar FastAPI para prever vibe a partir das features
   */
  async predictVibe(features: MlFeatures) {
    try {
      const url = `${this.ML_SERVICE_URL}/predict-vibe`;
      const response = await firstValueFrom(
        this.httpService.post(url, features, {
          timeout: 30000,
        }),
      );
      return (response as any).data as {
        vibe: string;
        scores?: Record<string, number>;
        features_used?: MlFeatures;
      };
    } catch (error: any) {
      this.logger.error(
        `Erro ao chamar ML Service (predict-vibe): ${error?.message}`,
        error?.response?.data,
      );
      throw new InternalServerErrorException(
        'Erro ao prever vibe. Tente novamente mais tarde.',
      );
    }
  }

  /**
   * Enviar feedback para retreinamento do modelo
   */
  async submitFeedback(payload: any) {
    try {
      const url = `${this.ML_SERVICE_URL}/feedback`;
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          timeout: 30000,
        }),
      );
      this.logger.log(`Feedback enviado ao ML Service: ${payload.reaction}`);
      return (response as any).data;
    } catch (error: any) {
      this.logger.error(
        `Erro ao enviar feedback ao ML Service: ${error?.message}`,
        error?.response?.data,
      );
      // Não fazer falhar a requisição se ML service estiver off
      return { success: false, message: 'Feedback não processado no ML Service' };
    }
  }

  /**
   * Health check do ML Service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.ML_SERVICE_URL}/`;
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 }),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.warn('ML Service indisponível');
      return false;
    }
  }
}
