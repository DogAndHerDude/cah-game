export declare class TooFewPlayersError extends Error {
    static message: string;
    constructor(current: number, expected: number);
}
