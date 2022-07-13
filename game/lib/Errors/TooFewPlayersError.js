"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooFewPlayersError = void 0;
class TooFewPlayersError extends Error {
    constructor(current, expected) {
        super(`${TooFewPlayersError.message}: ${current} out of ${expected}`);
        this.name = this.constructor.name;
    }
}
exports.TooFewPlayersError = TooFewPlayersError;
TooFewPlayersError.message = "Too few players";
//# sourceMappingURL=TooFewPlayersError.js.map