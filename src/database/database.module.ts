import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URL') || process.env.MONGO_URL || 'mongodb+srv://launchixai_db_user:TdKQsrePYY2a3mY1@launchix0.0pblfpo.mongodb.net/';
        console.log('Attempting to connect to MongoDB with URI:', uri ? 'URI found' : 'URI missing');
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
