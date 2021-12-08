import { Module } from '@nestjs/common';
import { AuthModule } from '../AuthService/AuthModule';
import { UserService } from './UserService';

@Module({
  imports: [AuthModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
