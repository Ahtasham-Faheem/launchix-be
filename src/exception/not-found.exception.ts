import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(entity: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${entity} not found`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}