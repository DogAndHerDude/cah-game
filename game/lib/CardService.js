"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const cah = __importStar(require("./cah-cards-compact.json"));
class CardService {
    constructor() {
        this.deck = CardService.hydrateCards();
    }
    static hydrateCards() {
        return cah.packs
            .filter(({ official }) => official)
            .map((pack, packIndex) => (Object.assign(Object.assign({}, pack), { white: pack.white.map((cardIndex) => ({
                text: cah.white[cardIndex],
                pack: packIndex,
            })), black: pack.black.map((cardIndex) => (Object.assign(Object.assign({}, cah.black[cardIndex]), { pack: packIndex }))) })));
    }
    getDeck(packs) {
        if (!packs || !packs.length) {
            return JSON.parse(JSON.stringify(this.deck));
        }
        return JSON.parse(JSON.stringify(this.deck.filter((_, index) => packs.includes(index))));
    }
}
exports.CardService = CardService;
//# sourceMappingURL=CardService.js.map