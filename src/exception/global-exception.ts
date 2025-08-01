import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      let message: any = 'Bad Request';
      const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
      if (
        exception.getResponse &&
        typeof exception.getResponse === 'function'
      ) {
        message = exception.getResponse();
        message = message?.message || message || 'Bad Request';
      }

      return response.status(status).json({
        statusCode: status,
        message,
      });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message:
        'Oops! Something went wrong. If the problem persists, contact support.',
    });
  }
}
