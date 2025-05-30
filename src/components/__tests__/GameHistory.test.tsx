import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import GameHistory from '../GameHistory'; // Adjust path as necessary
import { GameHistoryProps } from '../GameHistory'; // Assuming you export this type

describe('GameHistory Component', () => {
  // Mock formatDate to make tests deterministic regarding time
  const mockFormatDate = (date: Date) => `Time: ${date.getHours()}:${date.getMinutes()}`;

  beforeEach(() => {
    // Replace the actual formatDate with the mock for consistent testing
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      format: (date: Date | undefined) => mockFormatDate(date as Date),
    } as any));
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore original Intl.DateTimeFormat after each test
  });
  
  // Test Case 1: Empty History
  test('displays "No games played yet" when history is empty', () => {
    const history: GameHistoryProps['history'] = [];
    render(<GameHistory history={history} />);
    
    expect(screen.getByText(/No games played yet/i)).toBeInTheDocument();
    // Check that no mini-boards are rendered (e.g., by checking for a common class or structure of mini-boards)
    // For example, if mini-boards have a specific test-id or class:
    const miniBoards = screen.queryAllByTestId('mini-board-display'); // Assuming you add data-testid="mini-board-display"
    expect(miniBoards.length).toBe(0);
  });

  // Test Case 2: History with Games (including mini-board)
  test('displays game entries with outcomes, timestamps, and mini-boards', () => {
    const mockDate = new Date();
    const historyData: GameHistoryProps['history'] = [
      {
        id: 'game1',
        winner: 'X',
        moves: [{ player: 'X', board: ['X', 'O', 'X', 'O', 'X', null, 'O', null, 'X'] }],
        date: mockDate,
      },
      {
        id: 'game2',
        winner: null, // Draw
        moves: [{ player: 'O', board: ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'] }],
        date: new Date(mockDate.getTime() + 1000), // Different time
      },
    ];

    render(<GameHistory history={historyData} />);

    const gameEntries = screen.getAllByRole('button', { name: /View details for game played on/i });
    expect(gameEntries.length).toBe(historyData.length);

    // --- Check first game entry (X won) ---
    // Note: App.tsx pre-sorts history, so historyData[0] is the newest and appears first.
    const gameWonEntry = gameEntries[0]; // Corresponds to historyData[0] (X won)
    const drawGameEntry = gameEntries[1]; // Corresponds to historyData[1] (Draw)

    // Check X Won game (first in UI, first in data array)
    expect(within(gameWonEntry).getByText(/Player X won/i)).toBeInTheDocument();
    expect(within(gameWonEntry).getByText(mockFormatDate(historyData[0].date))).toBeInTheDocument();
    
    const miniBoardX = within(gameWonEntry).getByTestId('mini-board-display');
    expect(miniBoardX).toBeInTheDocument();
    
    // Check content of X's winning mini-board
    const xSquaresX = within(miniBoardX).getAllByText('X');
    const oSquaresX = within(miniBoardX).getAllByText('O');
    // historyData[0].moves[0].board = ['X', 'O', 'X', 'O', 'X', null, 'O', null, 'X'] -> 5 'X', 2 'O'
    expect(xSquaresX.length).toBe(5);
    expect(oSquaresX.length).toBe(2);
    // To count empty squares, we can check the number of children vs X and O
    const totalCellsX = within(miniBoardX).getAllByRole('gridcell'); // Assuming cells have role gridcell or similar
    expect(totalCellsX.length).toBe(9);
    expect(totalCellsX.length - xSquaresX.length - oSquaresX.length).toBe(2); // 2 empty squares

    // --- Check second game entry (Draw) ---
    // (second in UI, second in data array)
    expect(within(drawGameEntry).getByText(/Draw/i)).toBeInTheDocument();
    expect(within(drawGameEntry).getByText(mockFormatDate(historyData[1].date))).toBeInTheDocument();

    const miniBoardDraw = within(drawGameEntry).getByTestId('mini-board-display');
    expect(miniBoardDraw).toBeInTheDocument();

    // Check content of Draw mini-board
    const xSquaresDraw = within(miniBoardDraw).getAllByText('X');
    const oSquaresDraw = within(miniBoardDraw).getAllByText('O');
    // historyData[1].moves[0].board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'] -> 5 'X', 4 'O'
    expect(xSquaresDraw.length).toBe(5);
    expect(oSquaresDraw.length).toBe(4);
    const totalCellsDraw = within(miniBoardDraw).getAllByRole('gridcell');
    expect(totalCellsDraw.length).toBe(9);
    expect(totalCellsDraw.length - xSquaresDraw.length - oSquaresDraw.length).toBe(0); // 0 empty squares
  });

  // Test Case 3: Mini-board cell styling (Optional - more complex)
  test('mini-board cells have correct styling for X, O, and empty', () => {
    const historyData: GameHistoryProps['history'] = [
      {
        id: 'game3',
        winner: 'X',
        moves: [{ player: 'X', board: ['X', 'O', null, null, 'X', null, null, null, 'O'] }],
        date: new Date(),
      },
    ];
    render(<GameHistory history={historyData} />);
    
    const gameEntry = screen.getByRole('button', { name: /View details for game played on/i }); // Assuming one entry
    const miniBoard = within(gameEntry).getByTestId('mini-board-display');
    const cells = within(miniBoard).getAllByRole('gridcell');

    // Check classes for X, O, and empty based on the component's styling logic
    // This is more brittle as it depends on exact CSS classes
    // Example for the first cell (X):
    expect(cells[0]).toHaveClass('text-indigo-500', 'bg-indigo-100'); // From GameHistory.tsx
    expect(cells[0]).toHaveTextContent('X');

    // Example for the second cell (O):
    expect(cells[1]).toHaveClass('text-purple-500', 'bg-purple-100');
    expect(cells[1]).toHaveTextContent('O');

    // Example for the third cell (empty):
    expect(cells[2]).toHaveClass('bg-gray-200');
    expect(cells[2]).toHaveTextContent('');
  });

  // Test Case 4: onViewHistoricGame callback
  test('calls onViewHistoricGame with the correct game when a history item is clicked', () => {
    const mockOnViewHistoricGame = vi.fn();
    const mockDate1 = new Date();
    const mockDate2 = new Date(mockDate1.getTime() + 1000);

    const historyData: GameHistoryProps['history'] = [
      {
        id: 'game1',
        moves: [{ board: Array(9).fill('X'), player: 'X' }],
        winner: 'X',
        date: mockDate1,
      },
      {
        id: 'game2',
        moves: [{ board: Array(9).fill('O'), player: 'O' }],
        winner: 'O',
        date: mockDate2,
      },
    ];

    render(
      <GameHistory
        history={historyData}
        onViewHistoricGame={mockOnViewHistoricGame}
      />
    );

    // The component displays history in the order it receives (App.tsx already reverses it by prepending)
    // So, historyData[0] (game1) should be the first button
    const gameButtons = screen.getAllByRole('button');
    expect(gameButtons.length).toBe(historyData.length); // Ensure all items are rendered as buttons

    // Click the first game entry (game1)
    fireEvent.click(gameButtons[0]);
    expect(mockOnViewHistoricGame).toHaveBeenCalledTimes(1);
    expect(mockOnViewHistoricGame).toHaveBeenCalledWith(historyData[0]);

    mockOnViewHistoricGame.mockClear(); // Clear mock for the next assertion

    // Click the second game entry (game2)
    fireEvent.click(gameButtons[1]);
    expect(mockOnViewHistoricGame).toHaveBeenCalledTimes(1);
    expect(mockOnViewHistoricGame).toHaveBeenCalledWith(historyData[1]);
  });
});

// Note: The roles 'listitem', 'grid', 'gridcell' are not standard for button elements.
// The GameHistory component was updated in a previous task to wrap each entry in a <button>.
// So, querying by role 'button' is more appropriate for the clickable entries.
// The ARIA label added to these buttons is also a good way to query them.
// Example: screen.getByRole('button', { name: /View details for game played on/i });
// The internal structure for mini-board (grid/gridcell) is fine for `within` queries.

// Regarding the map order: App.tsx now prepends to gameHistory, so the history array
// is already in reverse chronological order. GameHistory.tsx iterates this as is.
// Thus, historyData[0] is the newest game and will be the first button.
