export const corsOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
       'http://localhost:3000',     // Local development
      'http://localhost:5173',     // Vite default port
      'http://3.92.141.250:3000',
      'http://3.92.141.250:5173',
      'https://platform.launchix.ai'
    ];