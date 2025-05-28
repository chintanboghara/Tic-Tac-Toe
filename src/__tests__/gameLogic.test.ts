import { describe, it, expect, test } from 'vitest'; // Added test
import { calculateWinner, checkDraw, getEasyAIMove } from '../utils/gameLogic'; // Added getEasyAIMove

describe('Game Logic', () => {
  describe('calculateWinner', () => {
    it('should return null when there is no winner', () => {
      const board = [null, null, null, null, null, null, null, null, null];
      expect(calculateWinner(board)).toBeNull();
    });

    it('should detect horizontal win for X', () => {
      const board = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
      const result = calculateWinner(board);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
      expect(result?.line).toEqual([0, 1, 2]);
    });

    it('should detect vertical win for O', () => {
      const board = ['X', 'O', 'X', null, 'O', 'X', null, 'O', null];
      const result = calculateWinner(board);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe('O');
      expect(result?.line).toEqual([1, 4, 7]);
    });

    it('should detect diagonal win', () => {
      const board = ['X', 'O', 'O', null, 'X', 'O', null, null, 'X'];
      const result = calculateWinner(board);
      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
      expect(result?.line).toEqual([0, 4, 8]);
    });
  });

  describe('checkDraw', () => {
    it('should return false when board is not full', () => {
      const board = ['X', 'O', 'X', 'O', null, 'X', 'O', 'X', 'O'];
      expect(checkDraw(board)).toBe(false);
    });

    it('should return false when there is a winner', () => {
      const board = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(checkDraw(board)).toBe(false);
    });

    it('should return true when board is full with no winner', () => {
      const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(checkDraw(board)).toBe(true);
    });
  });

  describe('getEasyAIMove', () => {
    test('should return a valid empty square index from a partially filled board', () => {
      const board = ['X', null, 'O', 'X', 'O', null, null, 'X', 'O'];
      // Expected empty indices: 1, 5, 6
      const emptyIndices = [1, 5, 6];
      const move = getEasyAIMove(board);
      expect(move).not.toBeNull();
      // Ensure the move is one of the known empty spots
      expect(emptyIndices).toContain(move);
      // Ensure the chosen spot was indeed null on the original board
      expect(board[move!]).toBeNull();
    });

    test('should return the only available empty square', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null];
      const move = getEasyAIMove(board);
      expect(move).toBe(8);
    });

    test('should return one of the two available empty squares', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', null, null];
      const emptyIndices = [7, 8];
      const move = getEasyAIMove(board);
      expect(move).not.toBeNull();
      expect(emptyIndices).toContain(move);
      expect(board[move!]).toBeNull();
    });

    test('should return null if the board is full', () => {
      const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
      const move = getEasyAIMove(board);
      expect(move).toBeNull();
    });

    test('should return null if the board is empty but passed as non-empty (edge case, though AI should not be called)', () => {
      // This tests if the logic correctly handles an empty board if, for some reason, it's called.
      const board = [null, null, null, null, null, null, null, null, null];
      const move = getEasyAIMove(board);
      expect(move).not.toBeNull(); // Should pick a square
      expect(move! >= 0 && move! <= 8).toBe(true);
      expect(board[move!]).toBeNull();
    });
  });
});
// Make sure to import getEasyAIMove at the top of the file
// import { calculateWinner, checkDraw, getEasyAIMove } from '../utils/gameLogic';