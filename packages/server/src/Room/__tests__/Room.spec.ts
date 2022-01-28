describe('Room', () => {
  describe('constructor', () => {
    it.todo(
      'Should create a room wit.todoh ID, and make the owner join the room socket',
    );
  });

  describe('listUsers', () => {
    it.todo('Should list all users');
  });

  describe('addUser', () => {
    it.todo('Should throw an error when user already exists');
    it.todo(
      'Should add a user, make user join room socket, and emit.todo events',
    );
  });

  describe('removeUser', () => {
    it.todo(
      'Should remove the only user, and leave socket and emit.todo ROOM_CLOSE event',
    );
    it.todo(
      'Should remove owner and replace the owner wit.todoh the next user',
    );
    it.todo('Should remove non-owner');
    it.todo('Should call game.removePlayer if game is in progress');
  });

  describe('getBasicRoomDetails', () => {
    it.todo('Should return basic room details when game is not in progress');
    it.todo(
      'Should return basic room details with the game summary when the game is in progress',
    );
  });

  describe('getRoomDetails', () => {
    it.todo('Should return room details when game is not in progress');
    it.todo(
      'Should return room details with the game details when the game is in progress',
    );
  });

  describe('incoming events', () => {
    it.todo('Should update game config and emit event on socket CONFIG_UPDATE');
    it.todo('Should call game.startGame on socket START_GAME');
  });
});
