import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App'; // Adjust path as necessary
import { getEasyAIMove as mockGetEasyAIMove } from '../../utils/gameLogic'; // Import the mock

// Mock setup for gameLogic
jest.mock('../../utils/gameLogic', () => ({
  ...jest.requireActual('../../utils/gameLogic'), // Keep other functions
  getEasyAIMove: jest.fn(),
}));

describe('App Component - Player Name Functionality', () => {
  // Test Case 1: Default Player Names
  test('renders with default player names in inputs and scoreboard', () => {
    render(<App />);
    
    // Check input fields
    const playerXInput = screen.getByLabelText(/Player X Name:/i) as HTMLInputElement;
    const playerOInput = screen.getByLabelText(/Player O Name:/i) as HTMLInputElement;
    expect(playerXInput.value).toBe('Player X');
    expect(playerOInput.value).toBe('Player O');

    // Check scoreboard (ScoreBoard component will render these names)
    // We look for the names within the ScoreBoard context.
    // Assuming ScoreBoard renders names in a way that they are identifiable.
    // If ScoreBoard uses specific elements/roles for names, query more specifically.
    expect(screen.getByText('Player X')).toBeInTheDocument(); // Default name for X in ScoreBoard
    expect(screen.getByText('Player O')).toBeInTheDocument(); // Default name for O in ScoreBoard
  });

  // Test Case 2: Updating Player Names
  test('updates player names in scoreboard when inputs change', () => {
    render(<App />);
    
    const playerXInput = screen.getByLabelText(/Player X Name:/i);
    const playerOInput = screen.getByLabelText(/Player O Name:/i);

    fireEvent.change(playerXInput, { target: { value: 'Alice' } });
    fireEvent.change(playerOInput, { target: { value: 'Bob' } });

    // Verify input values changed
    expect((playerXInput as HTMLInputElement).value).toBe('Alice');
    expect((playerOInput as HTMLInputElement).value).toBe('Bob');
    
    // Verify scoreboard updates
    // Querying within a specific section might be better if DOM is complex
    expect(screen.getByText('Alice')).toBeInTheDocument(); // Updated name for X
    expect(screen.getByText('Bob')).toBeInTheDocument();   // Updated name for O
    
    // Ensure old names are gone if they were uniquely identifiable
    expect(screen.queryByText('Player X')).not.toBeInTheDocument();
    expect(screen.queryByText('Player O')).not.toBeInTheDocument();
  });

  // Test Case 3: Player Names in Status Messages
  describe('Player Names in Status Messages', () => {
    test('displays updated player names in win and turn status messages', () => {
      render(<App />);
      
      const playerXInput = screen.getByLabelText(/Player X Name:/i);
      const playerOInput = screen.getByLabelText(/Player O Name:/i);

      fireEvent.change(playerXInput, { target: { value: 'Alice' } });
      fireEvent.change(playerOInput, { target: { value: 'Bob' } });

      // Initial status message with new names
      // Regex to accommodate the (X) or (O) part
      expect(screen.getByText(/Next player: Alice \(X\)/i)).toBeInTheDocument();

      // Simulate Alice (X) winning
      // Squares are buttons with aria-label like "Empty square" or "Square with X"
      // Or, we can get them by their implicit role if they are the only buttons in a row/grid cell
      const squares = screen.getAllByRole('button', { name: /square/i });
      
      fireEvent.click(squares[0]); // Alice (X)
      fireEvent.click(squares[3]); // Bob (O)
      fireEvent.click(squares[1]); // Alice (X)
      fireEvent.click(squares[4]); // Bob (O)
      fireEvent.click(squares[2]); // Alice (X) wins

      expect(screen.getByText('Alice wins!')).toBeInTheDocument();

      // Reset game
      const newGameButton = screen.getByRole('button', { name: /New Game/i });
      fireEvent.click(newGameButton);

      // Status message after reset, Bob's turn (O) because X (Alice) starts
      expect(screen.getByText(/Next player: Alice \(X\)/i)).toBeInTheDocument();
      
      // Simulate Bob (O) winning
      fireEvent.click(squares[0]); // Alice (X)
      fireEvent.click(squares[3]); // Bob (O)
      fireEvent.click(squares[1]); // Alice (X)
      fireEvent.click(squares[4]); // Bob (O)
      fireEvent.click(squares[6]); // Alice (X)
      fireEvent.click(squares[5]); // Bob (O) wins
      
      expect(screen.getByText('Bob wins!')).toBeInTheDocument();

      // Test "Next player" message for Bob after Alice plays
      fireEvent.click(newGameButton); // Reset
      fireEvent.click(squares[0]); // Alice (X) plays
      expect(screen.getByText(/Next player: Bob \(O\)/i)).toBeInTheDocument();
    });
  });
});

describe('App Component - AI Mode', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (mockGetEasyAIMove as jest.Mock).mockClear();
    jest.useFakeTimers(); // Use fake timers for setTimeout
  });

  afterEach(() => {
    act(() => { // Ensure all timers are processed
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers(); // Restore real timers
  });

  test('AI should make a move after player in "vs AI" mode', async () => {
    render(<App />);
    
    // Switch to AI mode
    fireEvent.click(screen.getByText(/Play vs AI \(Easy\)/i));
    
    // Mock AI's next move (e.g., to square 0, assuming it's empty after reset)
    (mockGetEasyAIMove as jest.Mock).mockReturnValue(0);

    // Player X makes a move (e.g., square 4)
    const squares = screen.getAllByRole('button', { name: /square/i });
    // Filter out ThemeSwitcher button if it's caught by "square" in aria-label (not the case here)
    // Current Square component uses "Empty square" or "Square with X/O".
    // ThemeSwitcher has "Switch to dark/light theme". So, no conflict expected.

    fireEvent.click(squares[4]); // Player X clicks square 4 (index 4)

    // Check that Player X's move is on the board
    // Re-query squares as their labels/content change
    let updatedSquares = screen.getAllByRole('button', { name: /square/i });
    expect(updatedSquares[4]).toHaveTextContent('X');
    expect(screen.getByText(/Easy AI is thinking.../i)).toBeInTheDocument();


    // Advance timers to cover the AI's setTimeout
    act(() => {
      jest.advanceTimersByTime(1000); // Match AI delay (750ms) + buffer
    });

    await waitFor(() => {
      expect(mockGetEasyAIMove).toHaveBeenCalled();
    });

    // Check if AI's move (square 0) is on the board
    updatedSquares = screen.getAllByRole('button', { name: /square/i });
    expect(updatedSquares[0]).toHaveTextContent('O');
    
    // Check if it's Player X's turn again
    expect(screen.getByText(/Your Turn/i)).toBeInTheDocument();
  });

  test('Player O name input should be disabled in AI mode and show AI name', () => {
    render(<App />);
    
    // Switch to AI mode
    fireEvent.click(screen.getByText(/Play vs AI \(Easy\)/i));
    
    const playerOInput = screen.getByLabelText(/Player O Name:/i) as HTMLInputElement;
    expect(playerOInput).toBeDisabled();
    expect(playerOInput.value).toBe('Easy AI');

    // Switch back to Player vs Player
    fireEvent.click(screen.getByText(/Play vs Player/i));
    expect(playerOInput).not.toBeDisabled();
    expect(playerOInput.value).toBe('Player O'); // Resets to default "Player O"
  });
});

describe('App Component - Detailed Statistics', () => {
  let localStorageGetItemSpy: jest.SpyInstance;
  let localStorageSetItemSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorageGetItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    localStorageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    (mockGetEasyAIMove as jest.Mock).mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    localStorageGetItemSpy.mockRestore();
    localStorageSetItemSpy.mockRestore();
    localStorage.clear();
    act(() => { // Ensure all timers are processed before restoring real timers
        jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('initializes with default stats if localStorage is empty', () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    // Check ScoreBoard for initial stats (Total Games: 0)
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('0');
    // Check PvP mode stats by default
    expect(screen.getByText('Player X').nextElementSibling?.textContent).toBe('0');
    expect(screen.getByText('Player O').nextElementSibling?.textContent).toBe('0');
    const drawElements = screen.getAllByText('Draws'); // Can be multiple "Draws" labels
    // Assuming the one in PvP is the one we care about here for default view
    // This query might need to be more specific if ScoreBoard structure changes
    expect(drawElements.find(el => el.closest('.mt-3'))?.nextElementSibling?.textContent).toBe('0');
  });

  test('initializes stats from localStorage if present', () => {
    const mockStats = {
      totalGamesPlayed: 5,
      pvp: { X: 2, O: 1, draws: 1 },
      pva: { playerXWins: 1, aiOWins: 0, draws: 0 },
    };
    localStorageGetItemSpy.mockReturnValue(JSON.stringify(mockStats));
    render(<App />);
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('5');
    // PvP mode is default
    expect(screen.getByText('Player X').nextElementSibling?.textContent).toBe('2');
    expect(screen.getByText('Player O').nextElementSibling?.textContent).toBe('1');
    const drawElements = screen.getAllByText('Draws');
    expect(drawElements.find(el => el.closest('.mt-3'))?.nextElementSibling?.textContent).toBe('1');
  });

  test('PvP Mode: Player X wins, updates stats and localStorage correctly', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    
    const squares = screen.getAllByRole('button', { name: /square/i });
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[3]); // O
    fireEvent.click(squares[1]); // X
    fireEvent.click(squares[4]); // O
    fireEvent.click(squares[2]); // X wins

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify({
          totalGamesPlayed: 1,
          pvp: { X: 1, O: 0, draws: 0 },
          pva: { playerXWins: 0, aiOWins: 0, draws: 0 },
        })
      );
    });
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('1');
    expect(screen.getByText('Player X').nextElementSibling?.textContent).toBe('1');
  });

  test('PvP Mode: Draw, updates stats and localStorage correctly', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    const squares = screen.getAllByRole('button', { name: /square/i });
    // X O X
    // X O X
    // O X O - Draw
    fireEvent.click(squares[0]); // X
    fireEvent.click(squares[1]); // O
    fireEvent.click(squares[2]); // X
    fireEvent.click(squares[3]); // O
    fireEvent.click(squares[5]); // X
    fireEvent.click(squares[4]); // O
    fireEvent.click(squares[6]); // X
    fireEvent.click(squares[8]); // O
    fireEvent.click(squares[7]); // X

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify({
          totalGamesPlayed: 1,
          pvp: { X: 0, O: 0, draws: 1 },
          pva: { playerXWins: 0, aiOWins: 0, draws: 0 },
        })
      );
    });
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('1');
    const drawElements = screen.getAllByText('Draws');
    expect(drawElements.find(el => el.closest('.mt-3'))?.nextElementSibling?.textContent).toBe('1');
  });

  test('PvA Mode: Player X (Human) Wins, updates stats and localStorage', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    fireEvent.click(screen.getByText(/Play vs AI \(Easy\)/i)); // Switch to PvA

    (mockGetEasyAIMove as jest.Mock).mockReturnValueOnce(3).mockReturnValueOnce(4); // AI moves

    const squares = screen.getAllByRole('button', { name: /square/i });
    fireEvent.click(squares[0]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI moves to 3
    fireEvent.click(squares[1]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI moves to 4
    fireEvent.click(squares[2]); // X wins

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify(expect.objectContaining({
          totalGamesPlayed: 1,
          pvp: { X: 0, O: 0, draws: 0 },
          pva: { playerXWins: 1, aiOWins: 0, draws: 0 },
        }))
      );
    });
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('1');
    // Check PvA stats in ScoreBoard (Player X (You))
    expect(screen.getByText(/Player X \(You\)/i).nextElementSibling?.textContent).toBe('1');
  });
  
  test('PvA Mode: AI Wins, updates stats and localStorage', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    fireEvent.click(screen.getByText(/Play vs AI \(Easy\)/i));

    (mockGetEasyAIMove as jest.Mock)
      .mockReturnValueOnce(0) // AI
      .mockReturnValueOnce(1) // AI
      .mockReturnValueOnce(2); // AI wins

    const squares = screen.getAllByRole('button', { name: /square/i });
    fireEvent.click(squares[3]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI moves to 0
    fireEvent.click(squares[4]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI moves to 1
    // Player X would play here, but AI will win on its next turn regardless of X's move
    // Let AI make its third move (triggered by X's turn ending after previous AI move)
    act(() => { jest.advanceTimersByTime(1000); }); // AI moves to 2 (and wins)

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify(expect.objectContaining({
          totalGamesPlayed: 1,
          pvp: { X: 0, O: 0, draws: 0 },
          pva: { playerXWins: 0, aiOWins: 1, draws: 0 },
        }))
      );
    });
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('1');
    expect(screen.getByText('Easy AI').nextElementSibling?.textContent).toBe('1');
  });

  test('PvA Mode: Draw, updates stats and localStorage', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    fireEvent.click(screen.getByText(/Play vs AI \(Easy\)/i));

    // Mock a sequence of AI moves that leads to a draw
    (mockGetEasyAIMove as jest.Mock)
      .mockReturnValueOnce(1) // O
      .mockReturnValueOnce(3) // O
      .mockReturnValueOnce(4) // O
      .mockReturnValueOnce(8); // O

    const squares = screen.getAllByRole('button', { name: /square/i });
    // X O X
    // O O X
    // X X O
    fireEvent.click(squares[0]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI to 1
    fireEvent.click(squares[2]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI to 3
    fireEvent.click(squares[5]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI to 4
    fireEvent.click(squares[6]); // X
    act(() => { jest.advanceTimersByTime(1000); }); // AI to 8
    fireEvent.click(squares[7]); // X - Draw

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify(expect.objectContaining({
          totalGamesPlayed: 1,
          pvp: { X: 0, O: 0, draws: 0 },
          pva: { playerXWins: 0, aiOWins: 0, draws: 1 },
        }))
      );
    });
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('1');
    const pvaDraws = screen.getAllByText('Draws').find(el => el.closest('.mt-3'));
    expect(pvaDraws?.nextElementSibling?.textContent).toBe('1');
  });

  test('resetStats clears all statistics and updates localStorage', async () => {
    const mockStats = {
      totalGamesPlayed: 5,
      pvp: { X: 2, O: 1, draws: 1 },
      pva: { playerXWins: 1, aiOWins: 0, draws: 0 },
    };
    localStorageGetItemSpy.mockReturnValue(JSON.stringify(mockStats));
    render(<App />);

    // Verify initial loaded stats
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('5');

    fireEvent.click(screen.getByRole('button', { name: /Reset All/i }));

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify({ // initialGameStats
          totalGamesPlayed: 0,
          pvp: { X: 0, O: 0, draws: 0 },
          pva: { playerXWins: 0, aiOWins: 0, draws: 0 },
        })
      );
    });
    expect(screen.getByText('Total Games').nextElementSibling?.textContent).toBe('0');
    // Check a few other stats to ensure they are reset
    expect(screen.getByText('Player X').nextElementSibling?.textContent).toBe('0');
    // If PvA mode was active, those would be visible, but default is PvP
    const drawElements = screen.getAllByText('Draws');
    expect(drawElements.find(el => el.closest('.mt-3'))?.nextElementSibling?.textContent).toBe('0');
  });
});
