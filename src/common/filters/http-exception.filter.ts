import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as Record<string, any>;
        message = body.message || exception.message;
      } else {
        message = exception.message;
      }
    } else {
      // Escenario 3: Fallos imprevistos retornan HTTP 500 controlado sin filtrar trazas sensibles
      this.logger.error('Error imprevisto en el servidor:', exception);
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Ha ocurrido un error interno no controlado en el servidor';
    }

    const errorPayload = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(errorPayload);
  }
}
