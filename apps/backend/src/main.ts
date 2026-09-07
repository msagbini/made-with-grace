import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ],
    credentials: true,
  });

  // Swagger/OpenAPI
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Sweet Grace API')
      .setDescription('E-commerce de galletas personalizadas')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Products', 'Catálogo de productos')
      .addTag('Orders', 'Gestión de pedidos')
      .addTag('Payments', 'Procesamiento de pagos')
      .addTag('Files', 'Subida y gestión de archivos')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 Sweet Grace API running on http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
