import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import { UserService } from 'src/users/user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guard/auth.guard';
import { CurrentUser } from 'src/decorator/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';

@ApiTags('Upload Images') // Group in Swagger UI
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly userService: UserService,
  ) { }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Res() res: Response,
  //   @CurrentUser() user: User
  // ) {
  //   try {
  //     const result = await this.uploadService.handleFileUpload(file);

  //     if (!result || !result.secure_url) {
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json({ success: false, error: 'Image upload failed' });
  //     }

  //     const { secure_url, public_id } = result;
  //     // const userId = req.user.id;
  //     const userId = user?._id;

  //     const updatedUser = await this.userService.findByIdAndUpdate(
  //       userId,
  //       { profileImage: secure_url },
  //       { new: true },
  //     );

  //     if (!updatedUser) {
  //       return res.status(HttpStatus.NOT_FOUND).json({
  //         success: false,
  //         error: 'User not found',
  //       });
  //     }

  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       profileImage: secure_url,
  //       public_id,
  //     });
  //   } catch (error) {
  //     console.error(error); // Log the error for debugging
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       error: 'Image upload failed',
  //       message: error.message,
  //     });
  //   }
  // }

  @Post('client/Img')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImgeClient(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @CurrentUser() user: User
  ) {
    try {
      const result = await this.uploadService.handleFileUpload(file);

      if (!result || !result.secure_url) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, error: 'Image upload failed' });
      }

      const { secure_url, public_id } = result;
      // const userId = req.user.id;
      const userId = user?._id;
      console.log('userId', userId);

      return res.status(HttpStatus.OK).json({
        success: true,
        clientProfileImage: secure_url,
        public_id,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Image upload failed',
        message: error.message,
      });
    }
  }

  @Post('invoice/Img')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImgeInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Request() req: any, // Accessing the request object
  ) {
    try {
      const result = await this.uploadService.handleFileUpload(file);

      if (!result || !result.secure_url) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ success: false, error: 'Image upload failed' });
      }

      const { secure_url, public_id } = result;
      // const userId = req.user.id;
      const userId = req.user?._id;
      console.log('userId', userId);

      return res.status(HttpStatus.OK).json({
        success: true,
        invoicelogo: secure_url,
        public_id,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Image upload failed',
        message: error.message,
      });
    }
  }
}
