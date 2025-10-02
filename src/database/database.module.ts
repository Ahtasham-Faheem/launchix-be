import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => {
    //     const uri = 'mongodb+srv://launchixai_db_user:TdKQsrePYY2a3mY1@launchix0.0pblfpo.mongodb.net/launchix?retryWrites=true&w=majority&appName=launchix0';
    //     return {
    //       uri,
    //     };
    //   },
    //   inject: [ConfigService],
    // }), 
    MongooseModule.forRoot('mongodb+srv://launchixai_db_user:TdKQsrePYY2a3mY1@launchix0.0pblfpo.mongodb.net/launchix?retryWrites=true&w=majority&appName=launchix0')
  ],
})
export class DatabaseModule {}
