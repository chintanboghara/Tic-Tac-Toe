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