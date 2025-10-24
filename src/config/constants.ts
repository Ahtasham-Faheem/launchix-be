import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();


export const CONFIG = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET: process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTkzYmFiYWQyNGE5NTVhYjg2NWE3NDMiLCJpYXQiOjE3MDQxODA0MTB9.-DFnIdL8LpDk1AGfzppoBgesxZByI7FjSWeeMolkjKY',

  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUD_NAME || '',
    API_KEY: process.env.CLOUD_API_KEY || '',
    API_SECRET: process.env.CLOUD_API_SECRET || '',
  },


  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 5,

  MAIL: {
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'Launchix AI <no-reply@launchix.ai>',
  },

  MONGO_URL: process.env.MONGO_URL || 'mongodb+srv://launchixai_db_user:TdKQsrePYY2a3mY1@launchix0.0pblfpo.mongodb.net/',

  FRONTEND_URL: process.env.Frontend_URL || 'http://localhost:5173',

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
