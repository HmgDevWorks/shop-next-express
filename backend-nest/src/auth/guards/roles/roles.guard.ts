import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private roles: string[]) {}
  canActivate(ctx: ExecutionContext) {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user.roles.some((r) => this.roles.includes(r))) {
      throw new ForbiddenException();
    }
    return true;
  }
}
