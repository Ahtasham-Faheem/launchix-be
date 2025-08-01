import { HttpException, HttpStatus } from '@nestjs/common';

export default async function handleErrorException(
  controllerFunction: () => Promise<any>,
): Promise<any> {
  try {
    return await controllerFunction();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    } else if (error instanceof HttpException) {
      throw new HttpException(error.message, error.getStatus());
    } else {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
