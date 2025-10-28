import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific field is requested, return only that field
    return data ? user?.[data] : user;
  },
);

// Usage example:
// @Get('profile')
// getUserProfile(@CurrentUser() user: any) {
//   return user;
// }
//
// @Get('email')
// getUserEmail(@CurrentUser('email') email: string) {
//   return { email };
// }