export const CONFIG = {
    PORT: process.env.PORT || 8000,
    JWT_SECRET: process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTkzYmFiYWQyNGE5NTVhYjg2NWE3NDMiLCJpYXQiOjE3MDQxODA0MTB9.-DFnIdL8LpDk1AGfzppoBgesxZByI7FjSWeeMolkjKY',
  
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUD_NAME || '',
      API_KEY: process.env.CLOUD_API_KEY || '',
      API_SECRET: process.env.CLOUD_API_SECRET || '',
    },
  
    MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB) || 5,
  
    EMAIL: {
      SERVICE: process.env.MAIL_SERVICE || 'gmail',
      USER: process.env.EMAIL_USER || '',
      PASS: process.env.EMAIL_PASS || '',
  
      SMTP: {
        HOST: process.env.SMTP_HOST || '',
        PORT: Number(process.env.SMTP_PORT) || 465,
        SECURE: process.env.SMTP_SECURE === 'true', // Convert string to boolean
        USER: process.env.SMTP_USER || '',
        PASS: process.env.SMTP_PASS || '',
      },
    },
  
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/x-invoice',
  
    FRONTEND_URL: process.env.Frontend_URL || 'http://localhost:3000',
  };
  