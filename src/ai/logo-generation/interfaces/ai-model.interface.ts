import { AIModel } from '../dto/logo-generation-request.dto';
import { LogoResult } from '../dto/logo-generation-response.dto';

export interface AIModelConfig {
  name: AIModel;
  apiEndpoint: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  enabled: boolean;
}

export interface GenerationParams {
  prompt: string;
  model: AIModel;
  width?: number;
  height?: number;
  quality?: string;
  style?: string;
}

export interface AIModelProvider {
  model: AIModel;
  generateLogo(params: GenerationParams): Promise<LogoResult>;
  isAvailable(): Promise<boolean>;
}