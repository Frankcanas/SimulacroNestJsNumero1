import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Requisito E / US-04: Validación global con eliminación de campos no admitidos (whitelist)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // US-08 / Requisito F: Estandarización de respuestas exitosas { success: true, data: ... }
  app.useGlobalInterceptors(new TransformInterceptor());

  // US-09 / Requisito G: Filtro centralizado de excepciones con statusCode, message y timestamp
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
