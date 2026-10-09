import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
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

    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader || typeof apiKeyHeader !== 'string' || apiKeyHeader.trim() === '') {
      throw new UnauthorizedException('Encabezado x-api-key ausente o no válido');
    }

    const rawConfigKeys = this.configService.get<string>('API_KEYS') || '';
    const validKeys = rawConfigKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const providedKey = apiKeyHeader.trim();

    if (validKeys.length === 0 || !validKeys.includes(providedKey)) {
      throw new UnauthorizedException('API Key inválida');
    }

    return true;
  }
}
