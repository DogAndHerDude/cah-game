"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const CardNotFoundError_1 = require("./CardNotFoundError");
class Player {
    constructor(id) {
        this.id = id;
        this.cards = [];
        this.playedCards = [];
        this.points = 0;
    }
    getCards() {
        return this.cards;
    }
    addCards(cards) {
        this.cards = [...this.cards, ...cards];
    }
    playCard(text) {
        const card = this.cards.find((card) => card.text === text);
        if (!card) {
            throw new CardNotFoundError_1.CardNotFoundError();
        }
        this.cardInPlay = card.text;
    }
    pickCard(text) {
        this.cardPick = text;
    }
    getCardPick() {
        return this.cardPick;
    }
    getCardInPlay() {
        return this.cardInPlay;
    }
    clearCardInPlay() {
        if (!this.cardInPlay) {
        }
        this.cards = this.cards.filter((card) => card.text !== this.cardInPlay);
        this.cardInPlay = undefined;
    }
    getPoints() {
        return this.points;
    }
    addPoint() {
        this.points += 1;
    }
    toPlain() {
        return {
            id: this.id,
            points: this.points,
        };
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map