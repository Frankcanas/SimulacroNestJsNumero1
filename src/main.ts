import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // US-10 / Requisito H: Documentación interactiva OpenAPI con Swagger UI en /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API REST Interna para Seguimiento Comercial')
    .setDescription(
      'Documentación técnica interactiva de la API REST para el seguimiento de solicitudes comerciales, control de acceso por roles y protección por API Key.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Clave de autorización API Key (ver API_KEYS en .env.example)',
      },
      'x-api-key',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-user',
        in: 'header',
        description:
          'Identificador de usuario en memoria (roles: admin, supervisor, asesor)',
      },
      'x-user',
    )
    .addSecurityRequirements('x-api-key')
    .addSecurityRequirements('x-user')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
