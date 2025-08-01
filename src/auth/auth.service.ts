import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  async signup(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) throw new ConflictException('User already exists');
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const _id = new mongoose.Types.ObjectId();
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    return { success: true, userId: user._id };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ id: user._id });
    return { success: true, userId: user._id, token };
  }
}