import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'winston.config';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);

  const app = await NestFactory.create(AppModule, { logger });
  app.enableCors(
    {
      origin: ['http://localhost:3000',
        'http://localhost:3001']
    }
  );
  await app.listen(3000);
}
bootstrap();
