import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3001);

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  });

  // API prefix
  app.setGlobalPrefix('api', {
    exclude: ['health', 'api-docs'],
  });

  // Versioning
  app.enableVersioning({ type: VersioningType.HEADER, header: 'X-API-Version' });

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TwilioHub OSS API')
    .setDescription('Complete API for the TwilioHub OSS communications platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'X-API-Key')
    .addTag('auth', 'Authentication')
    .addTag('users', 'User management')
    .addTag('organizations', 'Organization management')
    .addTag('twilio', 'Twilio integration')
    .addTag('messages', 'SMS messaging')
    .addTag('calls', 'Voice calls')
    .addTag('contacts', 'Contact management')
    .addTag('campaigns', 'SMS campaigns')
    .addTag('analytics', 'Analytics & reporting')
    .addTag('webhooks', 'Webhook management')
    .addTag('api-keys', 'API key management')
    .addTag('admin', 'Super admin')
    .addTag('dealers', 'Dealer/reseller portal')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Health check
  app.getHttpAdapter().get('/health', (_, res) => res.send({ status: 'ok', timestamp: new Date().toISOString() }));

  await app.listen(port);
  console.log(`🚀 TwilioHub API running on port ${port}`);
  console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
}
bootstrap();
