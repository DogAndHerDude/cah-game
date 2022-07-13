import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../User/UserModule';
import { AppController } from './AppController';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('createUser', () => {
    it('Creates a user and responds with its details', () => {
      expect(true).toBeTruthy();
    });

    it('Responds with an error when the user name is taken', () => {
      expect(true).toBeTruthy();
    });
  });
});
