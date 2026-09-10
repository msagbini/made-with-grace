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
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://made-with-grace.vercel.app',
    'https://made-with-grace-msagbini.vercel.app',
    process.env.NEXT_PUBLIC_SITE_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header) and any Vercel preview/production deployment
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      }
    },
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
