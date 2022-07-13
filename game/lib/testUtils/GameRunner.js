"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRunner = void 0;
const __1 = require("..");
class GameRunner {
    constructor(players, gameTimeout = 1000) {
        this.gameTimeout = gameTimeout;
        this.events = [];
        const cardService = new __1.CardService();
        const deck = new __1.GameDeck(cardService.getDeck(GameRunner.config.packs));
        this.playerStash = players;
        this.game = new __1.Game(players, GameRunner.config, deck);
        this.originalTimerBetweenRounds = __1.Game.TIMER_BETWEEN_ROUNDS;
        __1.Game.TIMER_BETWEEN_ROUNDS = 1;
        this.listenEvents();
    }
    async play() {
        return new Promise((resolve, reject) => {
            let timeout;
            this.game.startRound();
            this.game.on(__1.GameEvents.GAME_ENDED, () => {
                __1.Game.TIMER_BETWEEN_ROUNDS = this.originalTimerBetweenRounds;
                clearTimeout(timeout);
                resolve(this.events);
            });
            timeout = setTimeout(() => {
                __1.Game.TIMER_BETWEEN_ROUNDS = this.originalTimerBetweenRounds;
                reject(new Error(`GameRunner timed out after ${this.gameTimeout}ms`));
            }, this.gameTimeout);
        });
    }
    onRoundStarted(cb) {
        this.game.on(__1.GameEvents.ROUND_STARTED, (data) => {
            cb(data, this.playerStash, this.events);
        });
    }
    onPickStarted(cb) {
        this.game.on(__1.GameEvents.PICK_STARTED, (data) => {
            cb(data, this.playerStash, this.events);
        });
    }
    listenEvents() {
        Object.keys(__1.GameEvents).forEach((event) => this.onEvent(event));
    }
    onEvent(event) {
        this.game.on(event, (data) => {
            this.events.push({
                event,
                data,
            });
        });
    }
}
exports.GameRunner = GameRunner;
GameRunner.config = {
    pickTimer: 100,
    roundTimer: 100,
    maxPoints: 2,
    packs: [0],
    maxPlayers: 6,
};
//# sourceMappingURL=GameRunner.js.map