"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameDeck = void 0;
const lodash_shuffle_1 = __importDefault(require("lodash.shuffle"));
class GameDeck {
    constructor(deck) {
        this.whiteCards = this.mapWhiteCards(deck);
        this.blackCards = this.mapBlackCards(deck);
    }
    getWhiteCards(count) {
        return this.whiteCards.splice(0, count);
    }
    getBlackCard() {
        return this.blackCards.shift();
    }
    listWhiteCards() {
        return this.whiteCards.slice();
    }
    listBlackCards() {
        return this.blackCards.slice();
    }
    mapWhiteCards(deck) {
        return lodash_shuffle_1.default(deck.reduce((accumulator, pack) => {
            accumulator = [...accumulator, ...pack.white];
            return accumulator;
        }, []));
    }
    mapBlackCards(deck) {
        return lodash_shuffle_1.default(deck.reduce((accumulator, pack) => {
            accumulator = [...accumulator, ...pack.black];
            return accumulator;
        }, []));
    }
}
exports.GameDeck = GameDeck;
//# sourceMappingURL=GameDeck.js.map