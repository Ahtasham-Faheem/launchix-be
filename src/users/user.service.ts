// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User } from './schemas/user.schema';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class UserService {
//   constructor(@InjectModel(User.name) private userModel: Model<User>) {}
//   async getUserById(userId): Promise<User> {
//     return this.userModel
//       .findById(userId)
//       .populate(
//         'individualProfile organizationProfile subscription_id active_plan',
//       )
//       .exec();
//   }
//   async updateProfileImage(userId: string, imageUrl: string) {
//     return this.userModel.findByIdAndUpdate(
//       userId,
//       { profileImage: imageUrl },
//       { new: true },
//     );
//   }
//   async getAllUsers(): Promise<User[]> {
//     return this.userModel.find().exec();
//   }

//   async deleteUser(id: string): Promise<{ message: string; recordId: string }> {
//     const deletedRecord = await this.userModel.findByIdAndDelete(id);
//     if (!deletedRecord) {
//       throw new NotFoundException(
//         "The record you're trying to delete does not exist.",
//       );
//     }
//     return;
//   }

//   async updateUser(
//     id: string,
//     updateData: { oldPassword?: string; newPassword?: string },
//   ): Promise<User> {
//     const user = await this.userModel.findById(id);

//     if (!user) {
//       throw new NotFoundException('User not found.');
//     }

//     if (updateData.oldPassword) {
//       const isMatch = await bcrypt.compare(
//         updateData.oldPassword,
//         user.password,
//       );
//       if (!isMatch) {
//         throw new BadRequestException('Old password is incorrect.');
//       }
//       if (updateData.newPassword) {
//         user.password = await bcrypt.hash(updateData.newPassword, 10);
//       }
//     }

//     delete updateData.oldPassword;
//     delete updateData.newPassword;

//     Object.assign(user, updateData);

//     const updatedUser = await user.save();
//     if (!updatedUser) {
//       throw new NotFoundException('Record not found for update.');
//     }

//     return updatedUser;
//   }
// }

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async verifyUser(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).select('_id');
    return !!user;
  }

  async getUserProfile(userId: string) {
    return this.userModel.findById(userId).select('-password').lean();
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    const updateData = { ...updateUserDto };

    if (file) {
      const result = await new Promise<any>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        upload.end(file.buffer);
      });

      updateData['profileImage'] = result.secure_url;
    }

    return this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) return false;

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) return false;

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashed;
    await user.save();

    return true;
  }
}
