import { Module } from '@nestjs/common';
import { AppController } from './AppController';
import { RoomsModule } from '../Rooms/RoomsModule';
import { UserModule } from '../User/UserModule';

@Module({
  imports: [RoomsModule, UserModule],
  controllers: [AppController],
})
export class AppModule {}
