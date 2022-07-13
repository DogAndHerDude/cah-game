import { MockSocket } from '../../../test/MockSocket';
import { NameTakenError } from '../NameTakenError';
import { UserService } from '../UserService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('Should create a new user with given details', () => {
      const socket = new MockSocket();
      const user = userService.createUser('name', socket.__asSocket());

      expect(user).toStrictEqual(
        expect.objectContaining({
          id: expect.any(String),
          socket,
        }),
      );
    });

    it('Should throw an error when the user name is already taken', () => {
      const socket = new MockSocket();

      userService.createUser('name', socket.__asSocket());
      expect(() =>
        userService.createUser('name', socket.__asSocket()),
      ).toThrowError(NameTakenError);
    });
  });

  describe('getUser', () => {
    it('Should retrieve an existing user', () => {
      const socket = new MockSocket();
      const user = userService.createUser('name', socket.__asSocket());

      expect(userService.getUser(user.id)).toBe(user);
    });

    it('Should return undefined when no user is found', () => {
      expect(userService.getUser('id')).toBeUndefined();
    });
  });

  describe('removeUser', () => {
    it('Should remove an existing user, and when getting it it should return undefined', () => {
      const socket = new MockSocket();
      const user = userService.createUser('name', socket.__asSocket());

      userService.removeUser(user.id);
      expect(userService.getUser(user.id)).toBeUndefined();
    });
  });
});
