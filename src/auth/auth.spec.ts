import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiKeyGuard } from './guards/api-key.guard';
import { UserGuard, RequestWithUser } from './guards/user.guard';
import { RolesGuard } from './guards/roles.guard';
import { UsersService } from './services/users.service';
import { Role } from './enums/role.enum';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ROLES_KEY } from './decorators/roles.decorator';

function createMockExecutionContext(headers: Record<string, string | undefined> = {}, user?: any): {
  context: ExecutionContext;
  req: Partial<RequestWithUser>;
} {
  const req: Partial<RequestWithUser> = {
    headers: { ...headers },
    user,
  };

  const context = {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;

  return { context, req };
}

describe('ÉPICA 1 (EP-01): Seguridad, Identificación y Control de Acceso', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  describe('US-01: Protección de Endpoints mediante API Key (ApiKeyGuard)', () => {
    let configService: ConfigService;
    let apiKeyGuard: ApiKeyGuard;

    beforeEach(() => {
      configService = new ConfigService();
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'API_KEYS') {
          return 'clave_dev_1,clave_dev_2';
        }
        return undefined;
      });
      apiKeyGuard = new ApiKeyGuard(configService, reflector);
    });

    it('Escenario 1 (Sin cabecera): Petición sin x-api-key debe ser rechazada con 401 Unauthorized', () => {
      const { context } = createMockExecutionContext({});
      expect(() => apiKeyGuard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('Escenario 2 (Clave inválida): Petición con x-api-key errónea debe ser rechazada con 401 Unauthorized', () => {
      const { context } = createMockExecutionContext({ 'x-api-key': 'clave_falsa' });
      expect(() => apiKeyGuard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('Escenario 3 (Múltiples claves válidas): Permite el paso con la primera clave configurada', () => {
      const { context } = createMockExecutionContext({ 'x-api-key': 'clave_dev_1' });
      expect(apiKeyGuard.canActivate(context)).toBe(true);
    });

    it('Escenario 3 (Múltiples claves válidas): Permite el paso con la segunda clave configurada', () => {
      const { context } = createMockExecutionContext({ 'x-api-key': 'clave_dev_2' });
      expect(apiKeyGuard.canActivate(context)).toBe(true);
    });

    it('Escenario 4 (Cero Hardcoding): Lee dinámicamente las claves desde ConfigService sin quemarlas', () => {
      const { context } = createMockExecutionContext({ 'x-api-key': 'clave_dev_1' });
      apiKeyGuard.canActivate(context);
      expect(configService.get).toHaveBeenCalledWith('API_KEYS');
    });

    it('Escenario con ruta pública: Omite validación si la ruta tiene @Public()', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const { context } = createMockExecutionContext({});
      expect(apiKeyGuard.canActivate(context)).toBe(true);
    });
  });

  describe('US-02: Identificación y Validación de Usuarios en Memoria (UserGuard)', () => {
    let usersService: UsersService;
    let userGuard: UserGuard;

    beforeEach(() => {
      usersService = new UsersService();
      userGuard = new UserGuard(usersService, reflector);
    });

    it('Escenario 1 (Cabecera ausente): Petición sin x-user debe retornar 401 Unauthorized', () => {
      const { context } = createMockExecutionContext({});
      expect(() => userGuard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('Escenario 2 (Usuario inexistente): Petición con x-user ficticio debe retornar 401 Unauthorized', () => {
      const { context } = createMockExecutionContext({ 'x-user': 'usuario_fantasma' });
      expect(() => userGuard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('Escenario 3 (Usuario y rol válidos): Usuario admin existente se valida y se inyecta en la petición', () => {
      const { context, req } = createMockExecutionContext({ 'x-user': 'admin' });
      const result = userGuard.canActivate(context);

      expect(result).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user?.username).toBe('admin');
      expect(req.user?.role).toBe(Role.ADMIN);
    });

    it('Escenario 3 (Usuario y rol válidos): Usuario supervisor existente se valida y se inyecta en la petición', () => {
      const { context, req } = createMockExecutionContext({ 'x-user': 'supervisor' });
      const result = userGuard.canActivate(context);

      expect(result).toBe(true);
      expect(req.user?.username).toBe('supervisor');
      expect(req.user?.role).toBe(Role.SUPERVISOR);
    });

    it('Escenario 3 (Usuario y rol válidos): Usuario asesor existente (asesor_carlos) se valida y se inyecta', () => {
      const { context, req } = createMockExecutionContext({ 'x-user': 'asesor_carlos' });
      const result = userGuard.canActivate(context);

      expect(result).toBe(true);
      expect(req.user?.username).toBe('asesor_carlos');
      expect(req.user?.role).toBe(Role.ASESOR);
    });

    it('Escenario 4 (No confianza en rol de cliente): El rol asignado proviene del catálogo y no de inputs externos', () => {
      const { context, req } = createMockExecutionContext({ 'x-user': 'asesor1' });
      userGuard.canActivate(context);

      // El rol siempre será el correspondiente al catálogo en memoria para asesor1
      expect(req.user?.role).toBe(Role.ASESOR);
    });
  });

  describe('US-03: Control de Acceso Basado en Roles (RolesGuard)', () => {
    let rolesGuard: RolesGuard;

    beforeEach(() => {
      rolesGuard = new RolesGuard(reflector);
    });

    it('Escenario 1 (Acceso no autorizado): Usuario con rol "asesor" intentando ruta para "admin" y "supervisor" es rechazado con 403 Forbidden', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
        if (key === ROLES_KEY) return [Role.ADMIN, Role.SUPERVISOR];
        return undefined;
      });

      const { context } = createMockExecutionContext({}, {
        id: '5',
        username: 'asesor1',
        role: Role.ASESOR,
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('Escenario 2 (Acceso autorizado): Usuario con rol "admin" accediendo a ruta restringida es permitido', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
        if (key === ROLES_KEY) return [Role.ADMIN, Role.SUPERVISOR];
        return undefined;
      });

      const { context } = createMockExecutionContext({}, {
        id: '1',
        username: 'admin',
        role: Role.ADMIN,
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('Escenario 2 (Acceso autorizado): Usuario con rol "supervisor" accediendo a ruta restringida es permitido', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: string) => {
        if (key === ROLES_KEY) return [Role.ADMIN, Role.SUPERVISOR];
        return undefined;
      });

      const { context } = createMockExecutionContext({}, {
        id: '3',
        username: 'supervisor',
        role: Role.SUPERVISOR,
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('Escenario 3 (Endpoint de rol amplio): Endpoint sin decorador @Roles permite acceso a cualquier rol válido', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const { context } = createMockExecutionContext({}, {
        id: '5',
        username: 'asesor1',
        role: Role.ASESOR,
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });
  });
});
