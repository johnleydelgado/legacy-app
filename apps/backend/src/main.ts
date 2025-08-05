import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from "./app.module";
import { config as envConfig } from 'dotenv';

envConfig();

const config = new DocumentBuilder()
  .setTitle('Legacy Backend API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Get config service
  const configService = app.get(ConfigService);
  const isDevelopment = configService.get('NODE_ENV') === 'development';

  // Enable CORS
  app.enableCors({
    origin: '*',
    // origin: isDevelopment ? '*' : [
    //   'https://main.d3mvgqhd1x1ym0.amplifyapp.com',
    //   // 'http://localhost:3000',
    //   // 'http://localhost:3001',
    // ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Enable API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Get config service
  const port = configService.get<number>("PORT", 4000)

  // Set global prefix
  app.setGlobalPrefix("api")

  // Swagger API Docs
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha'
    }
  });

  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}

bootstrap();
