export interface GameStats {
  totalGamesPlayed: number;
  pvp: { X: number; O: number; draws: number };
  pva: { playerXWins: number; aiOWins: number; draws: number };
}

export type PlayerSymbol = 'X' | 'O'; // Actual player symbols

export interface BoardMove {
  board: Array<PlayerSymbol | null>; // The state of the board after the move
  player: PlayerSymbol;              // The player who made the move
  // Optional: moveIndex (number of the square clicked) could be added if useful for replay
}

export interface HistoricGame {
  id: string; // Unique ID, e.g., timestamp or UUID
  moves: BoardMove[];
  winner: PlayerSymbol | null; // 'X', 'O', or null for draw
  date: Date; // Can be string if stringified for localStorage, but Date object is better for use
  // Optional: winningLine?: number[] | null; // Could be useful for highlighting in history view
}

// You can add other shared types here in the future, for example:
// export type GameMode = 'twoPlayer' | 'vsAI';
// export type GameStatus = 'playing' | 'won' | 'draw';
// export type BoardState = Array<PlayerSymbol | null>; // Already covered by BoardMove.board
// etc.
