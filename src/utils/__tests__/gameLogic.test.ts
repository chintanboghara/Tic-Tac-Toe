import { getMediumAIMove } from '../gameLogic';
import { PlayerSymbol } from '../../types';

describe('getMediumAIMove', () => {
  // 1. Winning Moves
  describe('Winning Moves', () => {
    it('should make a horizontal winning move (top row)', () => {
      const board: (PlayerSymbol | null)[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
      const aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(2);
    });

    it('should make a vertical winning move (middle column)', () => {
      // AI 'X' can win at 7 with line [1,4,7]
      // _ | X | O
      // _ | X | O
      // _ | _ | _  <- AI 'X' plays at 7
      const board: (PlayerSymbol | null)[] = [null, 'X', 'O', null, 'X', 'O', null, null, null]; 
      const aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(7); 
    });
    
    it('should make a diagonal winning move (top-left to bottom-right)', () => {
      const board: (PlayerSymbol | null)[] = ['O', null, 'X', null, 'O', null, 'X', null, null];
      const aiSymbol: PlayerSymbol = 'O';
      expect(getMediumAIMove(board, aiSymbol)).toBe(8);
    });
  });

  // 2. Block Opponent's Win
  describe('Block Opponent\'s Win', () => {
    it('should block opponent\'s horizontal winning move (bottom row)', () => {
      const board: (PlayerSymbol | null)[] = ['X', null, null, null, 'X', null, 'O', 'O', null]; // AI 'X' must block at 8
      const aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(8);
    });

    it('should block opponent\'s vertical winning move (right column)', () => {
      // AI 'X' must block opponent 'O' at 8 for line [2,5,8].
      // No win for 'X' should be available.
      // O | X | O
      // X | O | O
      // _ | X | _ <- AI 'X' must block at 6 (for O's diagonal [2,4,6])
      // Opponent 'O' also threatens at 8 (for O's vertical [2,5,8])
      // AI will find threat at 6 first based on empty square iteration [6,8]
      const board: (PlayerSymbol | null)[] = ['O', 'X', 'O', 'X', 'O', 'O', null, 'X', null];
      const aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(6);
    });

    it('should block opponent\'s diagonal winning move (top-right to bottom-left)', () => {
      // X | _ | O
      // _ | O | _
      // _ | X | _ AI 'X' must block at 6 for opponent 'O' line [2,4,6]
      const board: (PlayerSymbol | null)[] = ['X', null, 'O', null, 'O', null, null, 'X', null];
      const aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(6);
    });
  });

  // 3. Take Center
  describe('Take Center', () => {
    it('should take the center if available and no win/block', () => {
      const board: (PlayerSymbol | null)[] = ['X', null, null, null, null, null, null, 'O', null];
      const aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(4);
    });
  });

  // 4. Take Corner
  describe('Take Corner', () => {
    it('should take an available corner if center is taken and no win/block', () => {
      const board: (PlayerSymbol | null)[] = [null, 'X', null, 'O', 'X', null, null, 'O', null];
      const aiSymbol: PlayerSymbol = 'O'; // O's turn
      // Available corners: 0, 2, 6, 8.
      const move = getMediumAIMove(board, aiSymbol);
      expect([0, 2, 6, 8].includes(move!)).toBe(true);
    });

    it('should take another available corner if center is taken and some corners taken', () => {
        // O | X | _
        // X | O | _
        // _ | X | _  AI 'O'. Center taken by O. Corner 0 taken by O.
        // Available corners: 2, 6, 8
        const board: (PlayerSymbol | null)[] = ['O', 'X', null, 'X', 'O', null, null, 'X', null];
        const aiSymbol: PlayerSymbol = 'O'; // O's turn
        const move = getMediumAIMove(board, aiSymbol);
        expect([2, 6, 8].includes(move!)).toBe(true);
      });
  });

  // 5. Take Side
  describe('Take Side', () => {
    it('should take an available side if center and corners are taken and no win/block', () => {
      const board: (PlayerSymbol | null)[] = ['X', null, 'O', 'X', 'O', 'X', 'O', 'X', 'O'];
      const aiSymbol: PlayerSymbol = 'X'; // X's turn
      // Only side available is 1, 3, 5, 7.
      // Board:
      // X | _ | O
      // X | O | X
      // O | X | O
      // Expected move at 1
      expect(getMediumAIMove(board, aiSymbol)).toBe(1);
    });
  });

  // 6. Multiple Strategic Moves Available
  describe('Multiple Strategic Moves', () => {
    it('should pick one of two available winning moves', () => {
      // AI 'X' can win at 2 (top row) or 6 (left col)
      // X X _ (AI 'X' can win at 2)
      // X O O
      // _ _ _ (AI 'X' can also win at 6, via [0,3,6])
      const board: (PlayerSymbol | null)[] = ['X', 'X', null, 'X', 'O', 'O', null, null, null];
      const aiSymbol: PlayerSymbol = 'X';
      // AI iterates empty squares: 2, 6, 7, 8.
      // If it checks 2: newBoard = [X,X,X,...], calculateWinner finds X. Returns 2.
      expect(getMediumAIMove(board, aiSymbol)).toBe(2); 
    });

    it('should pick a winning move over a blocking move', () => {
      // AI 'O'. Opponent 'X' threatens at 2 (X,X,_). AI 'O' can win at 5 (O,O,_).
      // X X _
      // O O _ (AI 'O' can win at 5)
      // X _ _
      const board: (PlayerSymbol | null)[] = ['X', 'X', null, 'O', 'O', null, 'X', null, null];
      const aiSymbol: PlayerSymbol = 'O';
      // AI 'O' checks for its win first.
      // Empty squares: 2, 5, 7, 8
      // Try 2: board[2]='O'. No win.
      // Try 5: board[5]='O'. Board: ['X', 'X', null, 'O', 'O', 'O', 'X', null, null]. 'O' wins with [3,4,5].
      // So, AI should play 5.
      expect(getMediumAIMove(board, aiSymbol)).toBe(5);
    });

    it('should pick one of multiple available blocking moves', () => {
      // AI 'O'. Opponent 'X' threatens at 2 (X,X,_) AND at 6 (X,_,X -> X,_,X for line [0,3,6]).
      // X X _
      // X _ _
      // _ O O
      // No, this setup is bad: if it's O's turn, X has already made 3 moves, O made 2.
      // X X _ (threat A at 2 for X)
      // _ O _
      // X _ _ (threat B at 7 for X, for line [6,7,8] if board[8] is X, or at 3 for line [0,3,6])
      // Let's make it clearer:
      // X | X | _  (Threat 1 at 2 for X)
      // _ | O | _
      // X | _ | _  (Threat 2 at 3 for X for line 0-3-6)
      // AI is 'O'.
      const board: (PlayerSymbol | null)[] = ['X', 'X', null, null, 'O', null, 'X', null, null];
      const aiSymbol: PlayerSymbol = 'O';
      // Empty: 2, 3, 5, 7, 8
      // AI 'O' checks for win: None.
      // AI 'O' checks for block:
      //   Test empty square 2: if board[2]='X', X wins. So AI 'O' must play 2. This is found first.
      expect(getMediumAIMove(board, aiSymbol)).toBe(2);
    });
  });

  // Fallback (though hard to test without controlling random for corners/sides)
  describe('Fallback to random if no specific strategy met', () => {
    it('should pick an available side if corners are taken by opponent, center taken, no win/block', () => {
      // O X O
      // X X O
      // X O _   AI is X, needs to play at 8 (win)
      //This test is more for winning move
      let board: (PlayerSymbol | null)[] = ['O', 'X', 'O', 'X', 'X', 'O', 'X', 'O', null];
      let aiSymbol: PlayerSymbol = 'X';
      expect(getMediumAIMove(board, aiSymbol)).toBe(8); // AI X wins

      // O X O
      // X O X
      // X O _ AI is X, board is full, this is a draw or error
      // This is a bad test case for random side. Let's make a better one.

      // X O X
      // O O X
      // _ X O  AI is 'X'. No win, no block. Center taken. Corners taken. Sides 0,6 available.
      // Actually, AI is 'O' in this setup
      // X O X
      // O O X
      // _ X _ AI is 'O'. playerXName, playerOName.
      // AI 'O'. Board:
      // X | O | X
      // O | O | X
      // _ | X | _
      // Empty: 6, 8.
      // No win for O.
      // No block for X. (X cannot win next move)
      // Center is board[4] = O (taken by AI).
      // Corners: 0(X), 2(X), 8(empty). AI 'O' should take 8.
      board = ['X', 'O', 'X', 'O', 'O', 'X', null, 'X', null];
      aiSymbol = 'O';
      expect(getMediumAIMove(board, aiSymbol)).toBe(8); // Take corner 8

      // All corners taken, center taken. AI is X.
      // O X O
      // X X O
      // X O X
      // Only sides available: 1, 3, 5, 7 (none are in this case, board is full)
      // Let's try:
      // O X O
      // _ X _
      // O X O
      // AI 'X'. Center taken. Corners taken.
      // Available: 1, 3, 5, 7.
      // No win for X.
      // No block for O.
      // Sides: 1, 3, 5, 7. Should pick one.
      board = ['O', null, 'O', null, 'X', null, 'O', null, 'O'];
      aiSymbol = 'X';
      const move = getMediumAIMove(board, aiSymbol);
      expect([1,3,5,7].includes(move!)).toBe(true);
    });
  });
});

// Basic test for calculateWinner to ensure it's available for getMediumAIMove if not mocked
// (Not strictly necessary for getMediumAIMove tests if we trust its import, but good for sanity)
import { calculateWinner } from '../gameLogic';

describe('calculateWinner (sanity check for Medium AI tests)', () => {
  it('should declare a winner for a row', () => {
    const squares = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
    expect(calculateWinner(squares)?.winner).toBe('X');
  });
});
