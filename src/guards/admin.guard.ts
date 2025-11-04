// src/admin/guards/admin.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { allowedAdminPannelRoles, UserRole } from 'src/constants/user.constant';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const role: UserRole = user.role || UserRole.USER;
    const isAdminFlag = user.isAdmin === true;

    const hasRole =
      isAdminFlag ||
      (role && allowedAdminPannelRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access admin APIs',
      );
    }

    return true;
  }
}
