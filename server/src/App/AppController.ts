import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from './DTO/CreateUserDTO';
import { CreateUserResponseDTO } from '../User/DTO/CreateUserResponseDTO';
import { UserService } from '../User/UserService';

@Controller()
export class AppController {
  constructor() {}
}
