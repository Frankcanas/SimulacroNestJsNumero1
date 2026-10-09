import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '../services/users.service';
import { User } from '../interfaces/user.interface';

export interface RequestWithUser extends Request {
  user?: User;
}

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const url = request.url || '';
    if (url.startsWith('/api/docs') || url.startsWith('/api/docs-json')) {
      return true;
    }

    const userHeader = request.headers['x-user'];

    if (!userHeader || typeof userHeader !== 'string' || userHeader.trim() === '') {
      throw new UnauthorizedException('Encabezado x-user ausente o no válido');
    }

    const user = this.usersService.findByUsername(userHeader.trim());

    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en el sistema');
    }

    // Inyectar el usuario validado en memoria en la petición (inmutable por el cliente)
    request.user = user;

    return true;
  }
}
