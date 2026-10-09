import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ExecutionContext,
  CallHandler,
  ArgumentsHost,
} from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';

describe('ÉPICA 3 (EP-03): Estandarización de Respuestas y Gestión Global de Errores', () => {
  describe('US-08: Estandarización de Respuestas Exitosas (TransformInterceptor)', () => {
    let interceptor: TransformInterceptor<any>;
    let mockExecutionContext: ExecutionContext;

    beforeEach(() => {
      interceptor = new TransformInterceptor();
      mockExecutionContext = {} as ExecutionContext;
    });

    it('Escenario 1 (Estructura uniforme de éxito): Transforma objeto a { success: true, data: <payload> }', async () => {
      const payload = { id: 1, cliente: 'Empresa Test', estado: 'PENDIENTE' };
      const callHandler: CallHandler = {
        handle: () => of(payload),
      };

      const result$ = interceptor.intercept(mockExecutionContext, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: payload,
      });
    });

    it('Escenario 1 (Estructura uniforme de éxito): Transforma listas de datos consistentemente', async () => {
      const payload = [{ id: 1 }, { id: 2 }];
      const callHandler: CallHandler = {
        handle: () => of(payload),
      };

      const result$ = interceptor.intercept(mockExecutionContext, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: payload,
      });
    });

    it('Escenario 1 (Estructura uniforme de éxito): Si data es null o undefined, retorna data: null', async () => {
      const callHandler: CallHandler = {
        handle: () => of(undefined),
      };

      const result$ = interceptor.intercept(mockExecutionContext, callHandler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual({
        success: true,
        data: null,
      });
    });

    it('Escenario 2 (Preservación de códigos HTTP de éxito): Mantiene respuesta intacta sin alterar el flujo del handler', async () => {
      const payload = { id: 99, mensaje: 'Creado' };
      const callHandler: CallHandler = {
        handle: () => of(payload),
      };

      const result$ = interceptor.intercept(mockExecutionContext, callHandler);
      const result = await lastValueFrom(result$);

      // El interceptor no modifica el código de respuesta HTTP del contexto
      expect(result.success).toBe(true);
      expect(result.data).toEqual(payload);
    });
  });

  describe('US-09: Normalización y Filtro Centralizado de Excepciones (HttpExceptionFilter)', () => {
    let filter: HttpExceptionFilter;
    let mockResponse: any;
    let mockHost: ArgumentsHost;

    beforeEach(() => {
      filter = new HttpExceptionFilter();
      mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => ({ url: '/solicitudes' }),
        }),
      } as unknown as ArgumentsHost;
    });

    it('Escenario 1 (Estructura obligatoria de cuerpo): Salida incluye statusCode, message y timestamp', () => {
      const exception = new NotFoundException('Recurso no encontrado');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Recurso no encontrado',
          timestamp: expect.any(String),
        }),
      );

      // Validar formato ISO 8601 del timestamp
      const sentJson = mockResponse.json.mock.calls[0][0];
      expect(new Date(sentJson.timestamp).toISOString()).toBe(sentJson.timestamp);
    });

    it('Escenario 2 (Códigos HTTP coherentes): Error 400 Bad Request (validación DTO)', () => {
      const exception = new BadRequestException('El nombre del cliente es obligatorio');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'El nombre del cliente es obligatorio',
        }),
      );
    });

    it('Escenario 2 (Códigos HTTP coherentes): Error 401 Unauthorized (API Key o usuario inválido)', () => {
      const exception = new UnauthorizedException('API Key inválida');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'API Key inválida',
        }),
      );
    });

    it('Escenario 2 (Códigos HTTP coherentes): Error 403 Forbidden (acceso denegado por rol o propiedad)', () => {
      const exception = new ForbiddenException('No tiene permisos para modificar esta solicitud');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'No tiene permisos para modificar esta solicitud',
        }),
      );
    });

    it('Escenario 2 (Códigos HTTP coherentes): Error 404 Not Found (recurso no existente)', () => {
      const exception = new NotFoundException('Solicitud con ID 10 no encontrada');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Solicitud con ID 10 no encontrada',
        }),
      );
    });

    it('Escenario 2 (Códigos HTTP coherentes): Error 409 Conflict (transición inválida de estado)', () => {
      const exception = new ConflictException('Transición inválida: Queda terminantemente prohibido el salto directo');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: 'Transición inválida: Queda terminantemente prohibido el salto directo',
        }),
      );
    });

    it('Escenario 3 (Control de errores imprevistos): Error genérico no expone trazas sensibles y retorna 500 controlado', () => {
      const unexpectedError = new Error('Database connection failed unexpectedly with credentials: root/secret');

      filter.catch(unexpectedError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Ha ocurrido un error interno no controlado en el servidor',
          timestamp: expect.any(String),
        }),
      );

      // Garantizar que la traza sensible del error o contraseña no se filtre al cliente
      const sentJson = mockResponse.json.mock.calls[0][0];
      expect(JSON.stringify(sentJson)).not.toContain('root/secret');
      expect(sentJson.stack).toBeUndefined();
    });
  });
});
