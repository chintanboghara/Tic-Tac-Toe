import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Award } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SoundProvider, useSounds } from './contexts/SoundContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import SoundToggler from './components/SoundToggler';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import { GameStats, HistoricGame, BoardMove, PlayerSymbol } from './types'; // Import new types
import GameHistory from './components/GameHistory';
import { calculateWinner, checkDraw, getEasyAIMove } from './utils/gameLogic';

// initialGameStats now uses the imported GameStats type
const initialGameStats: GameStats = {
  totalGamesPlayed: 0,
  pvp: { X: 0, O: 0, draws: 0 },
  pva: { playerXWins: 0, aiOWins: 0, draws: 0 },
};

function App() {
  const { playSound } = useSounds();

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  // Replace old scores state with new gameStats state
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const storedStats = localStorage.getItem('ticTacToeGameStats');
    return storedStats ? JSON.parse(storedStats) : initialGameStats;
  });
  const [playerXName, setPlayerXName] = useState("Player X");
  const [playerOName, setPlayerOName] = useState("Player O");
  const [gameMode, setGameMode] = useState<'twoPlayer' | 'vsAI'>('twoPlayer');
  const [gameHistory, setGameHistory] = useState<HistoricGame[]>(() => {
    const storedHistory = localStorage.getItem('ticTacToeGameHistory');
    try {
      // Ensure date strings are converted back to Date objects
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      return parsedHistory.map((game: any) => ({ ...game, date: new Date(game.date) }));
    } catch (error) {
      console.error("Error parsing game history from localStorage:", error);
      return [];
    }
  });
  const [currentMoves, setCurrentMoves] = useState<BoardMove[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // State for human player's symbol choice
  const [humanPlayerSymbol, setHumanPlayerSymbol] = useState<PlayerSymbol>(() => {
    const storedSymbol = localStorage.getItem('ticTacToeHumanSymbol') as PlayerSymbol | null;
    return storedSymbol || 'X'; // Default to 'X'
  });

  // State for viewing game history
  const [viewingHistoryGame, setViewingHistoryGame] = useState<HistoricGame | null>(null);
  const [historyStep, setHistoryStep] = useState<number>(0);

  // Persist gameStats to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeGameStats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Persist gameHistory to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeGameHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

  // Persist humanPlayerSymbol to localStorage
  useEffect(() => {
    localStorage.setItem('ticTacToeHumanSymbol', humanPlayerSymbol);
  }, [humanPlayerSymbol]);

  // Check for winner or draw & update gameStats and gameHistory
  useEffect(() => {
    const result = calculateWinner(board); // result can be { winner: 'X' | 'O', line: number[] } | null

    if (gameStatus === 'playing' && (result || checkDraw(board))) { // Only update if game was 'playing'
      const gameIsWon = !!result;
      const winner = result ? result.winner as PlayerSymbol : null;

      if (gameIsWon) {
        setGameStatus('won');
        setWinningLine(result!.line);
        playSound('win');
      } else { // Is a draw
        setGameStatus('draw');
        playSound('draw');
      }

      // Create and save the historic game entry
      // currentMoves already contains the final board state due to handleClick's logic
      const historicGameEntry: HistoricGame = {
        id: Date.now().toString(),
        moves: currentMoves, 
        winner: winner,
        date: new Date(),
      };
      setGameHistory(prevHistory => [historicGameEntry, ...prevHistory]);
      setCurrentMoves([]); // Clear current moves for the next game

      // Update statistics
      setGameStats(prevStats => {
        const newStats = { ...prevStats, totalGamesPlayed: prevStats.totalGamesPlayed + 1 };
        if (gameMode === 'twoPlayer') {
          newStats.pvp = {
            ...prevStats.pvp,
            [result.winner!]: prevStats.pvp[result.winner as PlayerSymbol] + 1,
          };
        } else { // gameMode === 'vsAI'
          if (result.winner === 'X') { 
            newStats.pva = { ...prevStats.pva, playerXWins: prevStats.pva.playerXWins + 1 };
          } else { 
            newStats.pva = { ...prevStats.pva, aiOWins: prevStats.pva.aiOWins + 1 };
          }
        }
        return newStats;
      });
    } else if (gameStatus === 'playing' && checkDraw(board)) { // Game Draw
        setGameStatus('draw');
        playSound('draw');
        
        const historicGameEntry: HistoricGame = {
          id: Date.now().toString(),
          moves: currentMoves,
          winner: null,
          date: new Date(),
        };
        setGameHistory(prevHistory => [historicGameEntry, ...prevHistory]);
        setCurrentMoves([]);

        setGameStats(prevStats => {
          const newStats = { ...prevStats, totalGamesPlayed: prevStats.totalGamesPlayed + 1 };
          if (gameMode === 'twoPlayer') {
            newStats.pvp = { ...prevStats.pvp, draws: prevStats.pvp.draws + 1 };
          } else { // gameMode === 'vsAI'
            newStats.pva = { ...prevStats.pva, draws: prevStats.pva.draws + 1 };
          }
          return newStats;
        });
    }
  }, [board, playSound, gameMode, currentMoves, gameStatus]); // gameStatus to ensure this runs only once per game end

  // Handle square click - wrapped with useCallback
  const handleClick = useCallback((index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    const newBoard = [...board];
    const currentPlayer = xIsNext ? 'X' : 'O';
    newBoard[index] = currentPlayer;

    const move: BoardMove = {
      board: [...newBoard], // Capture state *after* the move
      player: currentPlayer,
    };
    setCurrentMoves(prevMoves => [...prevMoves, move]);

    setBoard(newBoard);
    playSound('move');
    setXIsNext(!xIsNext);
  }, [board, xIsNext, gameStatus, playSound]); // Removed currentMoves from here to avoid re-creating handleClick on every move

  // useEffect for AI's turn
  useEffect(() => {
    if (gameMode === 'vsAI' && !xIsNext && gameStatus === 'playing') {
      const aiMove = getEasyAIMove(board);
      if (aiMove !== null) {
        const timer = setTimeout(() => {
          handleClick(aiMove);
        }, 750); // AI move delay
        return () => clearTimeout(timer); // Cleanup timeout
      }
    }
  }, [xIsNext, gameMode, gameStatus, board, handleClick]);

  // Reset the game
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameStatus('playing');
    setWinningLine(null);
    setCurrentMoves([]); // Clear current moves on game reset
  }, []);

  // Reset all stats
  const resetStats = useCallback(() => {
    resetGame();
    setGameStats(initialGameStats);
    localStorage.removeItem('ticTacToeGameStats');
    setGameHistory([]); // Clear history from state
    localStorage.removeItem('ticTacToeGameHistory'); // Clear new history from localStorage
    playSound('click');
  }, [resetGame, playSound]);

  // Function to handle viewing a historic game
  const handleViewHistoricGame = useCallback((game: HistoricGame) => {
    if (game.moves.length === 0) {
      console.warn("Attempted to view a historic game with no moves.");
      return;
    }
    setViewingHistoryGame(game);
    setHistoryStep(game.moves.length - 1); // Start by viewing the last move
    playSound('click'); // Play a click sound when viewing history
  }, [playSound]);

  // Function to handle viewing a historic game
  const handleViewHistoricGame = useCallback((game: HistoricGame) => {
    if (game.moves.length === 0) {
      console.warn("Attempted to view a historic game with no moves.");
      return;
    }
    setViewingHistoryGame(game);
    setHistoryStep(game.moves.length - 1); // Start by viewing the last move
    playSound('click'); // Play a click sound when viewing history
  }, [playSound]);

  // Navigation functions for history view
  const handleHistoryPrev = useCallback(() => {
    setHistoryStep(prevStep => Math.max(0, prevStep - 1));
    playSound('click');
  }, [playSound]);

  const handleHistoryNext = useCallback(() => {
    if (viewingHistoryGame) {
      setHistoryStep(prevStep => Math.min(viewingHistoryGame.moves.length - 1, prevStep + 1));
    }
    playSound('click');
  }, [viewingHistoryGame, playSound]);

  const handleExitHistoryView = useCallback(() => {
    setViewingHistoryGame(null);
    // historyStep state doesn't need explicit reset, it'll be unused.
    // The board will revert to live state automatically due to boardToDisplay logic.
    // The main useEffect for win/draw will re-evaluate based on live board.
    playSound('click');
  }, [playSound]);

  // Get current game status message
  const getStatusMessage = () => {
    // History Viewing Mode takes precedence for status message
    if (viewingHistoryGame) {
      const game = viewingHistoryGame;
      const move = game.moves[historyStep];
      let status = `Viewing history: Move ${historyStep + 1}/${game.moves.length}. Player ${move.player} moved.`;
      if (historyStep === game.moves.length - 1) { // Last move
        if (game.winner) {
          status += ` Game won by ${game.winner}.`;
        } else {
          status += " Game ended in a draw.";
        }
      }
      return status;
    }

    if (gameStatus === 'won') {
      const winnerSymbol = !xIsNext ? 'X' : 'O'; // The player who just made the move
      if (gameMode === 'vsAI') {
        return winnerSymbol === 'X' ? `${playerXName} (You) win!` : `${playerOName} wins!`;
      }
      const winnerName = winnerSymbol === 'X' ? playerXName : playerOName;
      return `${winnerName} wins!`;
    } else if (gameStatus === 'draw') {
      return "It's a draw!";
    } else { // Game is 'playing'
      if (gameMode === 'vsAI') {
        return xIsNext ? `Your Turn (${playerXName} - X)` : `${playerOName} is thinking...`;
      }
      const nextPlayerName = xIsNext ? playerXName : playerOName;
      return `Next player: ${nextPlayerName} (${xIsNext ? 'X' : 'O'})`;
    }
  };

  return (
    <ThemeProvider>
      <SoundProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white dark:bg-slate-850 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-indigo-600 dark:bg-indigo-700 text-white text-center relative">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Award className="h-8 w-8" />
              Tic Tac Toe
            </h1>
            <p className="text-indigo-200 dark:text-indigo-300 mt-1">A classic game reimagined</p>
            <div className="absolute top-4 right-4 flex gap-2"> {/* Use flex container */}
              <ThemeSwitcher />
              <SoundToggler /> {/* Add SoundToggler */}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Game Mode Selection */}
            <div className="my-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  setGameMode('twoPlayer');
                  resetGame();
                  if (playerOName === "Easy AI") {
                    setPlayerOName("Player O"); // Reset P2 name
                  }
                  playSound('click');
                }}
                disabled={!!viewingHistoryGame}
                className={`py-2 px-4 rounded-lg transition-colors
                            ${gameMode === 'twoPlayer' ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}
                            ${!!viewingHistoryGame ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Play vs Player
              </button>
              <button
                onClick={() => {
                  setGameMode('vsAI');
                  resetGame();
                  setPlayerOName("Easy AI"); // Set AI name
                  playSound('click');
                }}
                disabled={!!viewingHistoryGame}
                className={`py-2 px-4 rounded-lg transition-colors
                            ${gameMode === 'vsAI' ? 'bg-green-500 text-white dark:bg-green-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'}
                            ${!!viewingHistoryGame ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Play vs AI (Easy)
              </button>
            </div>

            {/* Player Name Inputs */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2">
                <label htmlFor="playerXName" className="text-sm font-medium text-gray-700 dark:text-gray-200">Player X Name:</label>
                <input
                  type="text"
                  id="playerXName"
                  value={playerXName}
                  onChange={(e) => setPlayerXName(e.target.value)}
                  disabled={!!viewingHistoryGame}
                  className="border p-1 rounded w-full sm:w-auto dark:bg-slate-700 dark:text-white dark:border-slate-600 disabled:opacity-50 dark:disabled:opacity-60"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="playerOName" className="text-sm font-medium text-gray-700 dark:text-gray-200">Player O Name:</label>
                <input
                  type="text"
                  id="playerOName"
                  value={playerOName}
                  onChange={(e) => setPlayerOName(e.target.value)}
                  disabled={gameMode === 'vsAI' || !!viewingHistoryGame} // Disable if AI mode OR viewing history
                  className="border p-1 rounded w-full sm:w-auto dark:bg-slate-700 dark:text-white dark:border-slate-600 disabled:opacity-50 dark:disabled:opacity-60"
                />
              </div>
            </div>
            
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4"> {/* Added mt-4 for spacing after name inputs */}
            {/* Game section */}
            <div className="md:col-span-2 flex flex-col items-center">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">{getStatusMessage()}</h2>
            </div>
            
            {(() => {
              // Determine current board to display
              const boardToDisplay = viewingHistoryGame
                ? viewingHistoryGame.moves[historyStep]?.board // Use optional chaining
                : board;

              // Determine if clicks should be enabled
              const canClickBoard = !viewingHistoryGame && gameStatus === 'playing';

              // Determine winning line to display
              let lineToShow = null;
              if (viewingHistoryGame) {
                const historicGame = viewingHistoryGame;
                if (historyStep === historicGame.moves.length - 1 && historicGame.winner) {
                  const historicWinInfo = calculateWinner(historicGame.moves[historyStep]?.board || []);
                  lineToShow = historicWinInfo ? historicWinInfo.line : null;
                }
              } else {
                lineToShow = winningLine; // Current game's winning line
              }

              return (
                <Board
                  squares={boardToDisplay || Array(9).fill(null)} // Fallback for safety
                  onClick={canClickBoard ? handleClick : () => {}}
                  winningLine={lineToShow}
                  isInteractive={canClickBoard} // Pass down interactivity
                />
              );
            })()}
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => {
                  resetGame();
                  playSound('click');
                }}
                disabled={!!viewingHistoryGame} // Disable when viewing history
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                New Game
              </button>
              <button
                onClick={resetStats} // resetStats already calls playSound('click')
                disabled={!!viewingHistoryGame} // Disable when viewing history
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Reset All
              </button>
            </div>

            {/* History Navigation Controls */}
            {viewingHistoryGame && (
              <div className="mt-4 p-4 border-t dark:border-slate-700">
                <h3 className="text-lg font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">
                  History Navigation
                </h3>
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={handleHistoryPrev}
                    disabled={historyStep === 0}
                    className="py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Previous Move
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Move {historyStep + 1} of {viewingHistoryGame.moves.length}
                  </span>
                  <button
                    onClick={handleHistoryNext}
                    disabled={historyStep === viewingHistoryGame.moves.length - 1}
                    className="py-2 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Next Move
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleExitHistoryView}
                    className="py-2 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition-colors"
                  >
                    Return to Current Game
                  </button>
                </div>
              </div>
            )}
          </div>
          
            {/* Stats section */}
            <div className="flex flex-col gap-6">
              <ScoreBoard 
                stats={gameStats} 
                playerXName={playerXName} 
                playerOName={playerOName} 
                gameMode={gameMode} 
              />
              <GameHistory history={gameHistory} onViewHistoricGame={handleViewHistoricGame} />
            </div>
          </div>
        </div> {/* Closes "max-w-4xl w-full ..." div */}
      </div> {/* Closes "min-h-screen bg-gradient-to-br ..." div */}
    </SoundProvider>
  </ThemeProvider>
  );
}

export default App;