// roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtAuthGuard right before this executes

    if (!user) {
      throw new ForbiddenException();
    }

    // Your class guard looks for a singular .role property on the user object
    const userRole = user.role;

    if (requiredRoles.includes(userRole)) {
      return true;
    }

    throw new ForbiddenException('Admin role required');
  }
}
