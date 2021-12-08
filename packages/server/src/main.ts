import { NestFactory } from '@nestjs/core';
import { AppModule } from './App/AppModule';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'http://localhost:3001',
    },
  });
  await app.listen(3000);
}

bootstrap();
