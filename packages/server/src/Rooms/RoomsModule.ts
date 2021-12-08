import { Module } from '@nestjs/common';
import { UserModule } from '../User/UserModule';
import { CardModule } from '../Cards/CardModule';
import { AuthModule } from '../AuthService/AuthModule';
import { RoomGateway } from './RoomGateway';
import { RoomService } from './RoomService';

@Module({
  imports: [UserModule, CardModule, AuthModule],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomsModule {}
