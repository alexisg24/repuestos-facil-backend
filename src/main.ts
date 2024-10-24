import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';
import { TypeOrmCustomExceptionFilter } from './common/exceptions/typeorm-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Nest Application Starting...');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new TypeOrmCustomExceptionFilter());
  await app.listen(envs.PORT);
  logger.log(`Application listening on port ${envs.PORT}`);
}
bootstrap();
