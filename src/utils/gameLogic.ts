/**
 * Calculate the winner of a tic-tac-toe game
 * @param squares The current state of the board
 * @returns The winner and winning line, or null if no winner
 */
export function calculateWinner(squares: Array<string | null>) {
  // All possible winning lines (rows, columns, diagonals)
  const lines = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal top-left to bottom-right
    [2, 4, 6], // diagonal top-right to bottom-left
  ];

  // Check each winning line
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: [a, b, c]
      };
    }
  }

  return null;
}

/**
 * Check if the game is a draw
 * @param squares The current state of the board
 * @returns True if the game is a draw, false otherwise
 */
export function checkDraw(squares: Array<string | null>): boolean {
  // Assumes calculateWinner has already been checked and returned no winner.
  // A draw occurs if all squares are filled and there is no winner.
  return squares.every(square => square !== null);
}

/**
 * Get a move for the Easy AI.
 * The Easy AI randomly picks an available square.
 * @param board The current state of the board (Array<string | null>)
 * @returns The index of the chosen square, or null if no moves are available.
 */
export function getEasyAIMove(board: Array<string | null>): number | null {
  const emptySquares: number[] = [];
  board.forEach((square, index) => {
    if (square === null) {
      emptySquares.push(index);
    }
  });

  if (emptySquares.length === 0) {
    return null; // No available moves
  }

  const randomIndex = Math.floor(Math.random() * emptySquares.length);
  return emptySquares[randomIndex];
}

/**
 * Get a move for the Medium AI.
 * The Medium AI follows a set of rules to pick a move:
 * 1. Win if possible.
 * 2. Block opponent's win if necessary.
 * 3. Take center.
 * 4. Take a corner.
 * 5. Take a side.
 * 6. Random move (fallback).
 * @param board The current state of the board (Array<PlayerSymbol | null>)
 * @param aiSymbol The symbol of the AI player ('X' or 'O')
 * @returns The index of the chosen square, or null if no moves are available.
 */
export function getMediumAIMove(board: Array<PlayerSymbol | null>, aiSymbol: PlayerSymbol): number | null {
  const opponentSymbol = aiSymbol === 'X' ? 'O' : 'X';
  const emptySquares: number[] = [];
  board.forEach((square, index) => {
    if (square === null) {
      emptySquares.push(index);
    }
  });

  if (emptySquares.length === 0) {
    return null; // No available moves
  }

  // 1. Winning Move: Check if the AI can make a move that results in a win.
  for (const move of emptySquares) {
    const newBoard = [...board];
    newBoard[move] = aiSymbol;
    if (calculateWinner(newBoard)?.winner === aiSymbol) {
      return move;
    }
  }

  // 2. Block Opponent's Win: Check if the opponent is one move away from winning.
  for (const move of emptySquares) {
    const newBoard = [...board];
    newBoard[move] = opponentSymbol;
    if (calculateWinner(newBoard)?.winner === opponentSymbol) {
      return move;
    }
  }

  // 3. Take Center: If the center square (index 4) is available, take it.
  if (board[4] === null) {
    return 4;
  }

  // 4. Take Corner: If any of the corner squares (indices 0, 2, 6, 8) are available.
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(index => board[index] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 5. Take Side: If any of the side squares (indices 1, 3, 5, 7) are available.
  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter(index => board[index] === null);
  if (availableSides.length > 0) {
    return availableSides[Math.floor(Math.random() * availableSides.length)];
  }

  // 6. Random Move (Fallback): Make any available random move.
  // This is effectively what getEasyAIMove does, but included for completeness
  // and in case the above logic somehow misses a scenario (e.g., board full but no winner yet, though checkDraw should handle this).
  const randomIndex = Math.floor(Math.random() * emptySquares.length);
  return emptySquares[randomIndex];
}