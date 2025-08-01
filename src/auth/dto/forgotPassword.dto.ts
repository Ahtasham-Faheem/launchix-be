import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  // @IsNotEmpty()
  // @IsString()
  // @MinLength(8)
  // @Matches(/^[a-zA-Z0-9!@#$%^&*]+$/, {
  //   message: 'New password must contain only letters, digits, and special characters',
  // })
  // newPassword: string;
}