// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { CONFIG } from 'src/config/constants';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
//     // MongooseModule.forRootAsync({
//     //   imports: [ConfigModule],
//     //   useFactory: async (configService: ConfigService) => {
//     //     const uri = 'mongodb+srv://launchixai_db_user:TdKQsrePYY2a3mY1@launchix0.0pblfpo.mongodb.net/launchix?retryWrites=true&w=majority&appName=launchix0';
//     //     return {
//     //       uri,
//     //     };
//     //   },
//     //   inject: [ConfigService],
//     // }), 
//     MongooseModule.forRoot(CONFIG.MONGO_URL),
//   ],
// })
// export class DatabaseModule {}


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
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
    }),
  ],
})
export class DatabaseModule {}

