import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) { }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      // if (!token) {
      //   return res.sendStatus(401); // Unauthorized
      // }

      const secretKey = this.configService.get<string>('JWT_SECRET');
      jwt.verify(token, secretKey, (err, decoded: any) => {
        if (err) return res.sendStatus(401);
        if (!decoded?.id) return res.sendStatus(401);

        req.user = decoded; // Skip DB call
        next();
      });
    } catch (error) {
      res.sendStatus(401); // Unauthorized
    }
  }
}
