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

describe('App Component - Choose Your Symbol & Game Logic', () => {
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
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });
  
  const getSquares = () => screen.getAllByRole('button', { name: /square/i });
  const getSymbolButton = (symbol: 'X' | 'O') => screen.getByRole('button', { name: `Play as ${symbol}`});
  const getGameModeButton = (modeText: RegExp) => screen.getByRole('button', { name: modeText });
  const getNewGameButton = () => screen.getByRole('button', { name: /New Game/i });

  test('default human symbol is X and X starts first in PvP', () => {
    localStorageGetItemSpy.mockReturnValue(null); // Ensure no stored symbol
    render(<App />);
    expect(getSymbolButton('X')).toHaveClass('bg-indigo-500'); // Active style for X
    expect(getSymbolButton('O')).not.toHaveClass('bg-purple-500');
    // Default name for X is "Player X"
    expect(screen.getByText(/Next player: Player X \(X\)/i)).toBeInTheDocument();
  });

  test('selecting O changes symbol, resets game, and O starts first in PvP', () => {
    render(<App />);
    fireEvent.click(getSymbolButton('O'));
    expect(getSymbolButton('O')).toHaveClass('bg-purple-500'); // Active style for O
    expect(getSymbolButton('X')).not.toHaveClass('bg-indigo-500');
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('ticTacToeHumanSymbol', 'O');
    // Board should be empty (reset)
    getSquares().forEach(sq => expect(sq).toBeEmptyDOMElement());
    // Default name for O is "Player O"
    expect(screen.getByText(/Next player: Player O \(O\)/i)).toBeInTheDocument(); 
  });

  test('symbol selection buttons are disabled after game starts', () => {
    render(<App />);
    fireEvent.click(getSquares()[0]); // X makes a move
    expect(getSymbolButton('X')).toBeDisabled();
    expect(getSymbolButton('O')).toBeDisabled();
  });

  test('symbol selection buttons are disabled during history view', async () => {
    render(<App />);
    // Play a game to create history
    fireEvent.click(getSquares()[0]); fireEvent.click(getSquares()[1]);
    fireEvent.click(getSquares()[2]); fireEvent.click(getSquares()[3]);
    fireEvent.click(getSquares()[4]); fireEvent.click(getSquares()[5]);
    fireEvent.click(getSquares()[6]); // X wins
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /View details for game played on/i })[0]).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByRole('button', { name: /View details for game played on/i })[0]);
    
    expect(getSymbolButton('X')).toBeDisabled();
    expect(getSymbolButton('O')).toBeDisabled();
  });

  test('Human as X starts first in PvP', () => {
    render(<App />);
    fireEvent.click(getSymbolButton('X')); // Explicitly select X
    expect(screen.getByText(/Next player: Player X \(X\)/i)).toBeInTheDocument();
  });

  test('Human as O starts first in PvP', () => {
    render(<App />);
    fireEvent.click(getSymbolButton('O'));
    // When human is O, Player O (human) is next
    expect(screen.getByText(/Next player: Player O \(O\)/i)).toBeInTheDocument();
  });

  test('Human as X, AI is O, AI makes O move', async () => {
    render(<App />);
    fireEvent.click(getSymbolButton('X'));
    fireEvent.click(getGameModeButton(/Play vs AI \(Easy\)/i));
    
    (mockGetEasyAIMove as jest.Mock).mockReturnValue(1); // AI will play at index 1

    fireEvent.click(getSquares()[0]); // Human (X) plays at 0
    expect(getSquares()[0]).toHaveTextContent('X');
    expect(screen.getByText(/Easy AI \(AI as O\) is thinking.../i)).toBeInTheDocument();

    act(() => { jest.advanceTimersByTime(1000); });

    await waitFor(() => expect(getSquares()[1]).toHaveTextContent('O'));
  });

  test('Human as O, AI is X, AI makes X move', async () => {
    render(<App />);
    fireEvent.click(getSymbolButton('O'));
    fireEvent.click(getGameModeButton(/Play vs AI \(Easy\)/i));
    
    // AI (X) should make the first move
    (mockGetEasyAIMove as jest.Mock).mockReturnValue(0); 
    expect(screen.getByText(/Easy AI \(AI as X\) is thinking.../i)).toBeInTheDocument();
    
    act(() => { jest.advanceTimersByTime(1000); });
    await waitFor(() => expect(getSquares()[0]).toHaveTextContent('X'));

    // Now human (O) plays
    expect(screen.getByText(/Your Turn \(Player O - O\)/i)).toBeInTheDocument();
    fireEvent.click(getSquares()[1]); // Human (O) plays at 1
    expect(getSquares()[1]).toHaveTextContent('O');
  });

  test('Human as O wins PvA, pva.humanWins increments', async () => {
    localStorageGetItemSpy.mockReturnValue(null); // Clear stats
    render(<App />);
    fireEvent.click(getSymbolButton('O'));
    fireEvent.click(getGameModeButton(/Play vs AI \(Easy\)/i));

    // Human (O) moves: 0, 1, 2 (wins)
    // AI (X) moves: 3, 4
    (mockGetEasyAIMove as jest.Mock).mockReturnValueOnce(3).mockReturnValueOnce(4);

    fireEvent.click(getSquares()[0]); // Human (O)
    act(() => { jest.advanceTimersByTime(1000); }); // AI (X) at 3
    fireEvent.click(getSquares()[1]); // Human (O)
    act(() => { jest.advanceTimersByTime(1000); }); // AI (X) at 4
    fireEvent.click(getSquares()[2]); // Human (O) wins

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify(expect.objectContaining({ pva: { humanWins: 1, aiWins: 0, draws: 0 } }))
      );
    });
    expect(screen.getByText(/Player O \(You as O\) win!/i)).toBeInTheDocument();
  });

  test('Human as X wins PvA, pva.humanWins increments', async () => {
    localStorageGetItemSpy.mockReturnValue(null); // Clear stats
    render(<App />);
    fireEvent.click(getSymbolButton('X')); // Default, but explicit for clarity
    fireEvent.click(getGameModeButton(/Play vs AI \(Easy\)/i));

    // Human (X) moves: 0, 1, 2 (wins)
    // AI (O) moves: 3, 4
    (mockGetEasyAIMove as jest.Mock).mockReturnValueOnce(3).mockReturnValueOnce(4);

    fireEvent.click(getSquares()[0]); // Human (X)
    act(() => { jest.advanceTimersByTime(1000); }); // AI (O) at 3
    fireEvent.click(getSquares()[1]); // Human (X)
    act(() => { jest.advanceTimersByTime(1000); }); // AI (O) at 4
    fireEvent.click(getSquares()[2]); // Human (X) wins

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameStats',
        JSON.stringify(expect.objectContaining({ pva: { humanWins: 1, aiWins: 0, draws: 0 } }))
      );
    });
    expect(screen.getByText(/Player X \(You as X\) win!/i)).toBeInTheDocument();
  });

  test('status messages are correct when human is O in PvA', async () => {
    render(<App />);
    fireEvent.click(getSymbolButton('O'));
    fireEvent.click(getGameModeButton(/Play vs AI \(Easy\)/i));
    
    // AI (X) is thinking (because Human is O, so X is AI and X starts)
    (mockGetEasyAIMove as jest.Mock).mockReturnValue(0); // AI will play at 0
    expect(screen.getByText(/Easy AI \(AI as X\) is thinking.../i)).toBeInTheDocument();
    
    act(() => { jest.advanceTimersByTime(1000); }); // AI makes move
    await waitFor(() => expect(getSquares()[0]).toHaveTextContent('X'));

    expect(screen.getByText(/Your Turn \(Player O - O\)/i)).toBeInTheDocument();
  });
  
  test('Scoreboard displays correctly when human is O in PvA', async () => {
    render(<App />);
    fireEvent.click(getSymbolButton('O'));
    fireEvent.click(getGameModeButton(/Play vs AI \(Easy\)/i));

    // Human is Player O (You), AI is Player X (Easy AI)
    expect(screen.getByText(/Player O \(You\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Easy AI/i)).toBeInTheDocument(); // AI name shown
    
    // Find the score elements next to these names
    const humanScoreElement = screen.getByText(/Player O \(You\)/i).parentElement?.nextElementSibling;
    const aiScoreElement = screen.getByText(/Easy AI/i).parentElement?.nextElementSibling;

    expect(humanScoreElement?.textContent).toBe('0'); // Initial score
    expect(aiScoreElement?.textContent).toBe('0');   // Initial score
  });
});

describe('App Component - History View Functionality', () => {
  let localStorageGetItemSpy: jest.SpyInstance;
  let localStorageSetItemSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorageGetItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    localStorageSetItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    (mockGetEasyAIMove as jest.Mock).mockClear(); // Clear AI move mock if used in setup
    jest.useFakeTimers(); // Use fake timers if any delays are involved (e.g., AI thinking)
  });

  afterEach(() => {
    localStorageGetItemSpy.mockRestore();
    localStorageSetItemSpy.mockRestore();
    localStorage.clear();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  // Helper function to play a game and return the board squares
  const playGame = (moves: number[]) => {
    const boardSquares = screen.getAllByRole('button', { name: /square/i });
    moves.forEach(moveIndex => {
      fireEvent.click(boardSquares[moveIndex]);
    });
    return screen.getAllByRole('button', { name: /square/i }); // Return updated squares
  };
  
  // Test Case 1: Storing history of moves and entering history view
  test('stores game moves, allows entering history view, and shows correct initial historic board', async () => {
    localStorageGetItemSpy.mockReturnValue(null); // Start with empty history
    render(<App />);

    // Play a short game: X wins
    // X O .
    // X O .
    // X . .
    playGame([0, 3, 1, 4, 2]); // X moves: 0, 1, 2. O moves: 3, 4
    
    await waitFor(() => {
      // Check that a game has been added to history
      expect(screen.getAllByRole('button', { name: /View details for game played on/i }).length).toBe(1);
    });

    // Click the first (and only) history item to view it
    const historyItemButton = screen.getByRole('button', { name: /View details for game played on/i });
    fireEvent.click(historyItemButton);

    // Verify history view mode is active
    expect(screen.getByText('History Navigation')).toBeInTheDocument();
    expect(screen.getByText(/Viewing history: Move 5\/5/i)).toBeInTheDocument(); // 5 moves total

    // Verify displayed board matches the last move of the historic game
    const boardSquaresInHistory = screen.getAllByRole('button', { name: /square/i });
    expect(boardSquaresInHistory[0]).toHaveTextContent('X');
    expect(boardSquaresInHistory[1]).toHaveTextContent('X');
    expect(boardSquaresInHistory[2]).toHaveTextContent('X');
    expect(boardSquaresInHistory[3]).toHaveTextContent('O');
    expect(boardSquaresInHistory[4]).toHaveTextContent('O');
    expect(boardSquaresInHistory[5]).toBeEmptyDOMElement();

    // Verify game controls are disabled
    expect(screen.getByRole('button', { name: /New Game/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Reset All/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Play vs Player/i })).toHaveClass('opacity-50');
    expect(screen.getByRole('button', { name: /Play vs AI \(Easy\)/i })).toHaveClass('opacity-50');
    expect(screen.getByLabelText(/Player X Name:/i)).toBeDisabled();
  });

  // Test Case 2: Navigating History
  test('allows navigating through historic moves', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    playGame([0, 3, 1, 4, 2]); // X wins in 5 moves

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /View details for game played on/i }).length).toBe(1);
    });
    fireEvent.click(screen.getByRole('button', { name: /View details for game played on/i }));
    
    const prevButton = screen.getByRole('button', { name: /Previous Move/i });
    const nextButton = screen.getByRole('button', { name: /Next Move/i });

    expect(nextButton).toBeDisabled(); // Starts at last move

    // Go to 4th move (O at 4)
    fireEvent.click(prevButton);
    expect(screen.getByText(/Viewing history: Move 4\/5/i)).toBeInTheDocument();
    let boardSquares = screen.getAllByRole('button', { name: /square/i });
    expect(boardSquares[0]).toHaveTextContent('X');
    expect(boardSquares[1]).toHaveTextContent('X');
    expect(boardSquares[2]).toBeEmptyDOMElement(); // Square 2 was X's winning move
    expect(boardSquares[3]).toHaveTextContent('O');
    expect(boardSquares[4]).toHaveTextContent('O');
    
    // Go to 1st move (X at 0)
    fireEvent.click(prevButton); // Move 3 (X at 1)
    fireEvent.click(prevButton); // Move 2 (O at 3)
    fireEvent.click(prevButton); // Move 1 (X at 0)
    expect(screen.getByText(/Viewing history: Move 1\/5/i)).toBeInTheDocument();
    expect(prevButton).toBeDisabled();
    boardSquares = screen.getAllByRole('button', { name: /square/i });
    expect(boardSquares[0]).toHaveTextContent('X');
    expect(boardSquares[1]).toBeEmptyDOMElement();
    expect(boardSquares[3]).toBeEmptyDOMElement();

    // Go back to last move
    fireEvent.click(nextButton); // Move 2
    fireEvent.click(nextButton); // Move 3
    fireEvent.click(nextButton); // Move 4
    fireEvent.click(nextButton); // Move 5
    expect(screen.getByText(/Viewing history: Move 5\/5/i)).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
    boardSquares = screen.getAllByRole('button', { name: /square/i });
    expect(boardSquares[2]).toHaveTextContent('X'); // Winning move visible again
  });
  
  // Test Case 3: Exiting History View Mode
  test('exits history view mode and reverts to current game state', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    // Play a game, X makes first move
    playGame([0]); // X at square 0
    
    // Simulate a second game that X wins (to have a history item)
    fireEvent.click(screen.getByRole('button', { name: /New Game/i }));
    playGame([0, 3, 1, 4, 2]); // X wins
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /View details for game played on/i }).length).toBe(1);
    });
    
    // Store current live board state before entering history view
    const liveBoardSquares = screen.getAllByRole('button', { name: /square/i }).map(sq => sq.textContent);

    fireEvent.click(screen.getByRole('button', { name: /View details for game played on/i })); // View the completed game
    expect(screen.getByText(/Viewing history: Move 5\/5/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Return to Current Game/i }));
    
    // Verify history navigation controls are gone
    expect(screen.queryByText('History Navigation')).not.toBeInTheDocument();
    expect(screen.queryByText(/Viewing history:/i)).not.toBeInTheDocument();

    // Verify board reverts to live game state (which was empty after New Game before the X win)
    const currentBoardSquares = screen.getAllByRole('button', { name: /square/i });
    currentBoardSquares.forEach((sq, index) => {
        // The live game was reset, so the board should be empty.
        // If a game was in progress, it should revert to that state.
        // Since we did "New Game", then played a full game, then viewed that full game,
        // exiting history should return to the live game state *after* the completed game.
        // The problem is the `board` state is the one from the completed game.
        // A "New Game" click after exiting history view is needed to truly test live board.
        // For now, let's check it reverts to the `board` state which is the last completed game.
        expect(sq.textContent).toBe(liveBoardSquares[index]);
    });

    // Verify game controls are re-enabled (assuming game is not over)
    // Since the last live game state was a win, these should still be enabled for a new game.
    expect(screen.getByRole('button', { name: /New Game/i })).not.toBeDisabled();
  });
  
  // Test Case 4: Board Interactivity
  test('board is not interactive during history view', async () => {
    localStorageGetItemSpy.mockReturnValue(null);
    render(<App />);
    playGame([0, 3, 1, 4, 2]); // X wins

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /View details for game played on/i }).length).toBe(1);
    });
    fireEvent.click(screen.getByRole('button', { name: /View details for game played on/i }));

    const boardSquares = screen.getAllByRole('button', { name: /square/i });
    // Attempt to click an empty square (e.g., square 5)
    fireEvent.click(boardSquares[5]);
    expect(boardSquares[5]).toBeEmptyDOMElement(); // Should remain empty, no new move
    expect(screen.getByText(/Viewing history: Move 5\/5/i)).toBeInTheDocument(); // Still in history mode
  });

  // Test Case 5: Storing history of moves (already implicitly tested by entering history mode)
  // This test case is more about the structure saved to localStorage if needed for direct inspection
  test('stores detailed move history in localStorage', async () => {
    localStorageGetItemSpy.mockReturnValue(null); // Ensure clean start
    render(<App />);
    
    // Player X moves to 0, Player O moves to 3, Player X moves to 1
    playGame([0, 3, 1]); 

    // Simulate game end (e.g., X wins by playing at 2 after O plays at 4)
    const squares = screen.getAllByRole('button', { name: /square/i });
    fireEvent.click(squares[4]); // O
    fireEvent.click(squares[2]); // X wins

    await waitFor(() => {
      expect(localStorageSetItemSpy).toHaveBeenCalledWith(
        'ticTacToeGameHistory',
        expect.stringContaining('"moves":') // Check that moves array is being saved
      );
    });

    const gameHistoryCall = localStorageSetItemSpy.mock.calls.find(
        (call) => call[0] === 'ticTacToeGameHistory'
    );
    const savedHistory = JSON.parse(gameHistoryCall![1]);
    expect(savedHistory.length).toBe(1);
    expect(savedHistory[0].moves.length).toBe(5); // 3 initial + 2 more
    expect(savedHistory[0].moves[0].player).toBe('X');
    expect(savedHistory[0].moves[0].board[0]).toBe('X');
    expect(savedHistory[0].moves[1].player).toBe('O');
    expect(savedHistory[0].moves[1].board[3]).toBe('O');
    expect(savedHistory[0].winner).toBe('X');
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
