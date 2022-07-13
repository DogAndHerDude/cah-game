"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGameConfig = void 0;
class DefaultGameConfig {
    constructor(roundTimer = 60000, pickTimer = 60000, maxPoints = 12, packs = [], maxPlayers = 12) {
        this.roundTimer = roundTimer;
        this.pickTimer = pickTimer;
        this.maxPoints = maxPoints;
        this.packs = packs;
        this.maxPlayers = maxPlayers;
    }
}
exports.DefaultGameConfig = DefaultGameConfig;
//# sourceMappingURL=DefaultGameConfig.js.map