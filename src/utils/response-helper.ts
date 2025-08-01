import ApiResponse from './api-response';

export default class ResponseHelper {
  public static createResponse<T>(
    data?: T,
    statusCode?: number,
    message?: string,
  ) {
    return new ApiResponse<T>(message, data, statusCode);
  }
}
