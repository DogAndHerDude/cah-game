import { AuthService } from '../../AuthService/AuthService';
import { CreateUserResponseDTO } from '../DTO/CreateUserResponseDTO';
import { NameTakenError } from '../NameTakenError';
import { UserService } from '../UserService';

describe('UserService', () => {
  describe('createUser', () => {
    const token = 'hello';
    let authService: AuthService;
    let userService: UserService;

    beforeEach(() => {
      authService = ({
        issueToken: () => token,
      } as unknown) as AuthService;

      userService = new UserService(authService);
    });

    it('Should create a new user with given details without any error', () => {
      const name = 'namerino';
      const response = userService.createUser(name);

      expect(response).toEqual(
        expect.objectContaining({
          name,
          id: expect.any(String),
        }),
      );
    });

    it('Should throw an error when the user name is already taken', () => {
      const name = 'namerino';
      userService.createUser(name);

      expect(() => userService.createUser(name)).toThrowError(NameTakenError);
    });
  });

  describe('getUser', () => {
    const token = 'hello';
    let authService: AuthService;
    let userService: UserService;

    beforeEach(() => {
      authService = ({
        issueToken: () => token,
      } as unknown) as AuthService;

      userService = new UserService(authService);
    });

    it('Should retrieve an existing user', () => {
      const name = 'namerino';
      const response = userService.createUser(name);

      expect(userService.getUser(response.user.id)).toEqual(response.user);
    });
  });

  describe('removeUser', () => {
    const token = 'hello';
    let authService: AuthService;
    let userService: UserService;

    beforeEach(() => {
      authService = ({
        issueToken: () => token,
      } as unknown) as AuthService;

      userService = new UserService(authService);
    });

    it('Should remove an existing user, and when getting it it should return undefined', () => {
      const name = 'namerino';
      const response = userService.createUser(name);

      expect(userService.getUser(response.user.id)).toEqual(response.user);
      userService.removeUser(response.user.id);
      expect(userService.getUser(response.user.id)).toBeUndefined();
    });
  });
});
