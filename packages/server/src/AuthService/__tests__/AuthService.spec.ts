import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../AuthService';
import { User } from '../../User/User';
import { MockSocket } from '../../../test/MockSocket';

describe('AuthService', () => {
  const authService = new AuthService(new JwtService({ secret: 'yes please' }));

  describe('issueToken', () => {
    it('Should issue a token with given users details', () => {
      const user = new User('name', new MockSocket().__asSocket());
      const token = authService.issueToken(user);

      expect(token).toEqual(expect.any(String));
    });
  });

  describe('validateToken', () => {
    it('Should validate given valid token and returns user details', () => {
      const user = new User('name', new MockSocket().__asSocket());
      const token = authService.issueToken(user);
      const decoded = authService.validateToken(token);

      expect(decoded).toStrictEqual({
        id: user.id,
        name: user.name,
        iat: expect.any(Number),
      });
    });

    it('Should return null when token cannot be validated', () => {
      const decoded = authService.validateToken('bad token');

      expect(decoded).toEqual(null);
    });
  });
});
