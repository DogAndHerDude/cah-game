import { Module } from '@nestjs/common';
import { CardService } from './CardService';

@Module({
  providers: [CardService],
  exports: [CardService],
})
export class CardModule {}
