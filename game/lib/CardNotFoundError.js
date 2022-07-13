"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardNotFoundError = void 0;
class CardNotFoundError extends Error {
    constructor() {
        super('Card not found');
        this.name = this.constructor.name;
    }
}
exports.CardNotFoundError = CardNotFoundError;
//# sourceMappingURL=CardNotFoundError.js.map