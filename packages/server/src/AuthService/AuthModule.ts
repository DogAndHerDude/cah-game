import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './AuthService';

@Module({
  imports: [JwtModule.register({ secret: 'super-secret!' })],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
