import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();


export const CONFIG = {
  PORT: configService.get<string>('PORT') || 8000,
  JWT_SECRET: configService.get<string>('JWT_SECRET') || 'default_jwt_secret',

  CLOUDINARY: {
    CLOUD_NAME: configService.get<string>('CLOUD_NAME') || '',
    API_KEY: configService.get<string>('CLOUD_API_KEY') || '',
    API_SECRET: configService.get<string>('CLOUD_API_SECRET') || '',
  },


  MAX_FILE_SIZE_MB: Number(configService.get<string>('MAX_FILE_SIZE_MB') || 5),

  MAIL: {
    RESEND_API_KEY: configService.get<string>('RESEND_API_KEY') || '',
    EMAIL_FROM: configService.get<string>('EMAIL_FROM') || 'Launchix AI <no-reply@launchix.ai>',
  },

  MONGO_URL: configService.get<string>('MONGO_URL') || 'mongodb://localhost:27017/launchix_ai',

  GOOGLE: {
    CLIENT_ID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
    CLIENT_SECRET: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
    REDIRECT_URI: configService.get<string>('GOOGLE_REDIRECT_URI') || '',
    FRONTEND_LANDING_URL: configService.get<string>('GOOGLE_FRONTEND_LANDING_URL') || 'http://localhost:5173',
  },
  AI_KEYS: {
    OPENAI_API_KEY: configService.get<string>('OPENAI_API_KEY') || '',
    REPLICATE_API_KEY: configService.get<string>('REPLICATE_API_KEY') || '',
    DEEPSEEK_API_KEY: configService.get<string>('DEEPSEEK_API_KEY') || '',
  }
};
