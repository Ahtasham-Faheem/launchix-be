// src/decorator/admin.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export function AdminOnly() {
  return applyDecorators(ApiBearerAuth(), UseGuards(AuthGuard, AdminGuard));
}
