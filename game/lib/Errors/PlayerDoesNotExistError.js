"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerDoesNotExistError = void 0;
class PlayerDoesNotExistError extends Error {
    constructor() {
        super(PlayerDoesNotExistError.message);
        this.name = this.constructor.name;
    }
}
exports.PlayerDoesNotExistError = PlayerDoesNotExistError;
PlayerDoesNotExistError.message = "Player does not exist";
//# sourceMappingURL=PlayerDoesNotExistError.js.map