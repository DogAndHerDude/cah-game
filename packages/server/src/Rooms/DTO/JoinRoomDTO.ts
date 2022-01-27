import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class JoinRoomDTO {
  @IsNotEmpty()
  @IsString()
  public readonly roomID: string;
  @IsNotEmpty()
  @IsBoolean()
  public readonly spectator: boolean;
}
