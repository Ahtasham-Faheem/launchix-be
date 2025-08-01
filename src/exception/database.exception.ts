import { HttpException, HttpStatus } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: message || 'Database operation failed',
        error: 'Database Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}