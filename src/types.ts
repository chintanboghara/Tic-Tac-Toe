export interface GameStats {
  totalGamesPlayed: number;
  pvp: { X: number; O: number; draws: number };
  pva: { playerXWins: number; aiOWins: number; draws: number };
}

// You can add other shared types here in the future, for example:
// export type PlayerSymbol = 'X' | 'O' | null;
// export type GameMode = 'twoPlayer' | 'vsAI';
// export type GameStatus = 'playing' | 'won' | 'draw';
// export type BoardState = Array<PlayerSymbol>;
// etc.
