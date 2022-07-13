"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const events_1 = require("events");
const GameEvents_1 = require("./GameEvents");
const TooFewPlayersError_1 = require("./Errors/TooFewPlayersError");
const PlayerDoesNotExistError_1 = require("./Errors/PlayerDoesNotExistError");
class Game extends events_1.EventEmitter {
    constructor(players, config, deck) {
        super();
        this.players = players;
        this.config = config;
        this.deck = deck;
        this.round = 0;
        if (players.length < Game.MIN_PLAYERS) {
            throw new TooFewPlayersError_1.TooFewPlayersError(players.length, Game.MIN_PLAYERS);
        }
    }
    getGameSummary() {
        var _a, _b;
        return {
            players: this.players.length,
            round: this.round,
            topScore: (_b = (_a = this.players
                .slice()
                .sort((a, b) => (a.getPoints() > b.getPoints() ? 1 : -1))
                .pop()) === null || _a === void 0 ? void 0 : _a.getPoints()) !== null && _b !== void 0 ? _b : 0,
        };
    }
    getGameDetails() {
        var _a, _b;
        return {
            players: (_b = (_a = this.players) === null || _a === void 0 ? void 0 : _a.map((player) => player.toPlain())) !== null && _b !== void 0 ? _b : [],
        };
    }
    getPlayers() {
        return this.players;
    }
    getRound() {
        return this.round;
    }
    getCardCar() {
        return this.cardCzar;
    }
    getNextCardCzar() {
        return this.nextCzar;
    }
    removePlayer(playerID) {
        this.players = this.players.filter((player) => player.id !== playerID);
        if (this.players.length < Game.MIN_PLAYERS) {
            this.endGame();
            return;
        }
        if (playerID === this.nextCzar) {
            this.prepareNextCardCzar();
            return;
        }
        if (this.cardCzar === playerID) {
            this.endRoundPrematurely();
        }
    }
    playCard(playerID, card) {
        const player = this.players.find(({ id }) => id === playerID);
        if (player) {
            player === null || player === void 0 ? void 0 : player.playCard(card);
            this.emitEvent(GameEvents_1.GameEvents.PLAYER_CARD_PLAYED, {
                playerID,
            });
        }
        else {
            throw new PlayerDoesNotExistError_1.PlayerDoesNotExistError();
        }
        if (this.allPlayersPlayedCards()) {
            this.endPlay();
        }
    }
    pickCard(playerID, card) {
        if (playerID !== this.cardCzar) {
            return;
        }
        const cardCzar = this.players.find(({ id }) => id === this.cardCzar);
        const winningPlayer = this.players.find((player) => player.getCardInPlay() === card);
        cardCzar === null || cardCzar === void 0 ? void 0 : cardCzar.pickCard(card);
        winningPlayer === null || winningPlayer === void 0 ? void 0 : winningPlayer.addPoint();
        this.endPick();
    }
    startRound() {
        if (!this.round) {
            this.emitEvent(GameEvents_1.GameEvents.GAME_STARTED);
        }
        this.round += 1;
        const blackCard = this.deck.getBlackCard();
        if (blackCard === undefined) {
            this.endGame();
            return;
        }
        this.pickCardCzar();
        this.handOutCards();
        this.emitEvent(GameEvents_1.GameEvents.ROUND_STARTED, {
            blackCard,
            cardCzar: this.cardCzar,
            roundTimer: this.config.roundTimer,
        });
        this.roundTimer = setTimeout(() => this.endPlay, this.config.roundTimer);
    }
    pickCardCzar() {
        if (!this.nextCzar) {
            this.cardCzar = this.players[0].id;
        }
        else {
            this.cardCzar = this.nextCzar;
        }
        this.prepareNextCardCzar();
    }
    prepareNextCardCzar() {
        const prevCardCzarIndex = this.players.findIndex(({ id }) => id === this.cardCzar);
        const nextCzar = this.players[prevCardCzarIndex + 1];
        if (nextCzar) {
            this.nextCzar = nextCzar.id;
        }
        else {
            this.nextCzar = this.players[0].id;
        }
    }
    handOutCards() {
        this.players.forEach((player) => {
            const playerCards = player.getCards();
            const newCards = this.deck.getWhiteCards(Game.MAX_CARDS - playerCards.length);
            player.addCards(newCards);
        });
        this.emitEvent(GameEvents_1.GameEvents.HAND_OUT_CARDS, this.players.reduce((accumulator, player) => {
            accumulator[player.id] = player.getCards();
            return accumulator;
        }, {}));
    }
    endPlay() {
        clearTimeout(this.roundTimer);
        const playedCards = this.players
            .filter(({ id }) => id !== this.cardCzar)
            .map((player) => {
            return player.getCardInPlay();
        })
            .filter(Boolean);
        if (!playedCards.length) {
            this.endRoundPrematurely("No cards played");
        }
        this.emitEvent(GameEvents_1.GameEvents.PLAY_ENDED, {
            playedCards,
        });
        this.startPickTimer();
    }
    startPickTimer() {
        this.pickTimer = setTimeout(() => this.endPick, this.config.pickTimer);
        this.emitEvent(GameEvents_1.GameEvents.PICK_STARTED, {
            pickTimer: this.config.pickTimer,
        });
    }
    endPick() {
        clearTimeout(this.pickTimer);
        this.postRoundHandler();
    }
    endRoundPrematurely(reason) {
        if (this.playerReachedMaxPoints()) {
            this.endGame();
            return;
        }
        this.players.forEach((player) => player.clearCardInPlay());
        this.emitEvent(GameEvents_1.GameEvents.ROUND_ENDED, {
            reason,
        });
        this.startTimer = setTimeout(() => this.startRound(), Game.TIMER_BETWEEN_ROUNDS);
    }
    postRoundHandler() {
        var _a, _b;
        const cardCzar = this.players.find(({ id }) => id === this.cardCzar);
        if (!cardCzar) {
            this.startTimer = setTimeout(() => this.startRound(), Game.TIMER_BETWEEN_ROUNDS);
            return;
        }
        const winningPlayer = this.players.find((player) => cardCzar.getCardPick() === player.getCardInPlay());
        this.emitEvent(GameEvents_1.GameEvents.PICK_ENDED, {
            playerID: (_a = winningPlayer === null || winningPlayer === void 0 ? void 0 : winningPlayer.id) !== null && _a !== void 0 ? _a : null,
            winningCard: (_b = winningPlayer === null || winningPlayer === void 0 ? void 0 : winningPlayer.getCardInPlay()) !== null && _b !== void 0 ? _b : null,
        });
        if (this.playerReachedMaxPoints()) {
            this.endGame();
            return;
        }
        this.players.forEach((player) => player.clearCardInPlay());
        this.emitEvent(GameEvents_1.GameEvents.ROUND_ENDED);
        this.startTimer = setTimeout(() => this.startRound(), Game.TIMER_BETWEEN_ROUNDS);
    }
    endGame(reason) {
        this.cleanupTimers();
        this.emitEvent(GameEvents_1.GameEvents.GAME_ENDED, {
            summary: this.getGameSummary(),
            reason,
        });
    }
    cleanupTimers() {
        clearTimeout(this.startTimer);
        clearTimeout(this.roundTimer);
        clearTimeout(this.pickTimer);
    }
    playerReachedMaxPoints() {
        return (this.players.find((player) => player.getPoints() === this.config.maxPoints) !== undefined);
    }
    allPlayersPlayedCards() {
        return (this.players
            .filter(({ id }) => id !== this.cardCzar)
            .find((player) => !!player.getCardInPlay()) !== undefined);
    }
    emitEvent(event, data) {
        this.emit(event, data);
    }
}
exports.Game = Game;
Game.TIMER_BETWEEN_ROUNDS = 5000;
Game.MAX_CARDS = 6;
Game.MIN_PLAYERS = 2;
//# sourceMappingURL=Game.js.map