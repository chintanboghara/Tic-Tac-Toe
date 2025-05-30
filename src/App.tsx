import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Award } from 'lucide-react';
import { useSounds } from './contexts/SoundContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import SoundToggler from './components/SoundToggler';
import Board from './components/Board';
import ScoreBoard from './components/ScoreBoard';
import { GameStats, HistoricGame, BoardMove, PlayerSymbol } from './types';
import GameHistory from './components/GameHistory';
import { calculateWinner, checkDraw, getEasyAIMove } from './utils/gameLogic';

const initialGameStats: GameStats = {
  totalGamesPlayed: 0,
  pvp: { X: 0, O: 0, draws: 0 },
  pva: { playerXWins: 0, aiOWins: 0, draws: 0 },
};

function App() {
  const { playSound } = useSounds();

  const [board, setBoard] = useState<(PlayerSymbol | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
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
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : null; // Allow null
      return Array.isArray(parsedHistory) ? parsedHistory.map((game: any) => ({ ...game, date: new Date(game.date) })) : [];
    } catch (error) {
      console.error("Error parsing game history from localStorage:", error);
      return [];
    }
  });
  const [currentMoves, setCurrentMoves] = useState<BoardMove[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [humanPlayerSymbol, setHumanPlayerSymbol] = useState<PlayerSymbol>(() => {
    const storedSymbol = localStorage.getItem('ticTacToeHumanSymbol') as PlayerSymbol | null;
    return storedSymbol || 'X';
  });
  const [viewingHistoryGame, setViewingHistoryGame] = useState<HistoricGame | null>(null);
  const [historyStep, setHistoryStep] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('ticTacToeGameStats', JSON.stringify(gameStats));
  }, [gameStats]);

  useEffect(() => {
    localStorage.setItem('ticTacToeGameHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

  useEffect(() => {
    localStorage.setItem('ticTacToeHumanSymbol', humanPlayerSymbol);
  }, [humanPlayerSymbol]);

  useEffect(() => {
    const result = calculateWinner(board);
    if (gameStatus === 'playing' && (result || checkDraw(board))) {
      const gameIsWon = !!result;
      const winner = result ? result.winner : null;

      if (gameIsWon) {
        setGameStatus('won');
        setWinningLine(result!.line);
        playSound('win');
      } else {
        setGameStatus('draw');
        playSound('draw');
      }

      const historicGameEntry: HistoricGame = {
        id: Date.now().toString(),
        moves: currentMoves, 
        winner: winner,
        date: new Date(),
      };
      setGameHistory(prevHistory => [historicGameEntry, ...prevHistory]);
      setCurrentMoves([]);

      setGameStats(prevStats => {
        const newStats = { ...prevStats, totalGamesPlayed: prevStats.totalGamesPlayed + 1 };
        if (gameMode === 'twoPlayer') {
          if (winner) { // Ensure winner is not null before indexing
            newStats.pvp = {
              ...prevStats.pvp,
              [winner]: prevStats.pvp[winner] + 1,
            };
          } else { // Draw
             newStats.pvp = { ...prevStats.pvp, draws: prevStats.pvp.draws + 1 };
          }
        } else { // gameMode === 'vsAI'
          if (winner === humanPlayerSymbol) {
            newStats.pva = { ...prevStats.pva, playerXWins: prevStats.pva.playerXWins + 1 };
          } else if (winner) { // AI won
            newStats.pva = { ...prevStats.pva, aiOWins: prevStats.pva.aiOWins + 1 };
          } else { // Draw
            newStats.pva = { ...prevStats.pva, draws: prevStats.pva.draws + 1 };
          }
        }
        return newStats;
      });
    } else if (gameStatus === 'playing' && checkDraw(board)) {
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
          } else {
            newStats.pva = { ...prevStats.pva, draws: prevStats.pva.draws + 1 };
          }
          return newStats;
        });
    }
  }, [board, playSound, gameMode, currentMoves, gameStatus, humanPlayerSymbol]);

  const handleClick = useCallback((index: number) => {
    if (board[index] || gameStatus !== 'playing' || (gameMode === 'vsAI' && (xIsNext && humanPlayerSymbol === 'O') || (!xIsNext && humanPlayerSymbol === 'X'))) return;

    const newBoard = [...board];
    const currentPlayer = xIsNext ? 'X' : 'O';
    newBoard[index] = currentPlayer;

    const move: BoardMove = { board: [...newBoard], player: currentPlayer };
    setCurrentMoves(prevMoves => [...prevMoves, move]);
    setBoard(newBoard);
    playSound('move');
    setXIsNext(!xIsNext);
  }, [board, xIsNext, gameStatus, playSound, gameMode, humanPlayerSymbol]);

  useEffect(() => {
    if (gameMode === 'vsAI' && gameStatus === 'playing') {
      const isAiTurnX = xIsNext && humanPlayerSymbol === 'O';
      const isAiTurnO = !xIsNext && humanPlayerSymbol === 'X';
      if (isAiTurnX || isAiTurnO) {
        const aiMove = getEasyAIMove(board);
        if (aiMove !== null) {
          const timer = setTimeout(() => {
            handleClick(aiMove);
          }, 750);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [xIsNext, gameMode, gameStatus, board, handleClick, humanPlayerSymbol]);

  const resetGame = useCallback((isSwitchingMode = false) => {
    setBoard(Array(9).fill(null));
    if (gameMode === 'vsAI' && humanPlayerSymbol === 'O' && isSwitchingMode) {
        setXIsNext(true); 
    } else {
        setXIsNext(true); 
    }
    setGameStatus('playing');
    setWinningLine(null);
    setCurrentMoves([]);
    setViewingHistoryGame(null); 
  }, [gameMode, humanPlayerSymbol]);


  const resetStats = useCallback(() => {
    resetGame();
    setGameStats(initialGameStats);
    localStorage.removeItem('ticTacToeGameStats');
    setGameHistory([]);
    localStorage.removeItem('ticTacToeGameHistory');
    playSound('click');
  }, [resetGame, playSound]);

  const handleViewHistoricGame = useCallback((game: HistoricGame) => {
    if (game.moves.length === 0) {
      console.warn("Attempted to view a historic game with no moves.");
      return;
    }
    setViewingHistoryGame(game);
    setHistoryStep(game.moves.length - 1);
    playSound('click');
  }, [playSound]);

  const handleHistoryPrev = useCallback(() => {
    setHistoryStep(prevStep => Math.max(0, prevStep - 1)); 
    playSound('click');
  }, []);

  const handleHistoryNext = useCallback(() => {
    if (viewingHistoryGame) {
      setHistoryStep(prevStep => Math.min(viewingHistoryGame.moves.length - 1, prevStep + 1));
    }
    playSound('click');
  }, [viewingHistoryGame, playSound]);

  const handleExitHistoryView = useCallback(() => {
    setViewingHistoryGame(null);
    playSound('click');
  }, [playSound]);

  const handleSymbolChange = (symbol: PlayerSymbol) => {
    setHumanPlayerSymbol(symbol);
    resetGame(true); 
  };
  
  const handleGameModeChange = (mode: 'twoPlayer' | 'vsAI') => {
    setGameMode(mode);
    if (mode === 'vsAI') {
      setPlayerOName("Easy AI");
    } else {
      if (playerOName === "Easy AI") { 
          setPlayerOName("Player O");
      }
    }
    resetGame(true); 
  };

  const getStatusMessage = () => {
    if (viewingHistoryGame) {
      const game = viewingHistoryGame;
      const move = game.moves[historyStep];
      if (!move) return "Loading history..."; 
      let status = `Viewing history: Move ${historyStep + 1}/${game.moves.length}. Player ${move.player} moved.`;
      if (historyStep === game.moves.length - 1) {
        if (game.winner) status += ` Game won by ${game.winner}.`;
        else status += " Game ended in a draw.";
      }
      return status;
    }

    if (gameStatus === 'won') {
      const winnerSymbol = !xIsNext ? 'X' : 'O';
      if (gameMode === 'vsAI') {
        return winnerSymbol === humanPlayerSymbol ? `${playerXName} (You as ${humanPlayerSymbol}) win!` : `${playerOName} (AI as ${winnerSymbol}) wins!`;
      }
      const winnerName = winnerSymbol === 'X' ? playerXName : playerOName;
      return `${winnerName} wins!`;
    } else if (gameStatus === 'draw') {
      return "It's a draw!";
    } else {
      if (gameMode === 'vsAI') {
        const aiPlayerSymbol = humanPlayerSymbol === 'X' ? 'O' : 'X';
        return (xIsNext && humanPlayerSymbol === 'X') || (!xIsNext && humanPlayerSymbol === 'O')
          ? `Your Turn (${humanPlayerSymbol === 'X' ? playerXName : playerOName} - ${humanPlayerSymbol})`
          : `${playerOName === "Easy AI" ? "Easy AI" : playerOName} (AI as ${aiPlayerSymbol}) is thinking...`;
      }
      const nextPlayerName = xIsNext ? playerXName : playerOName;
      return `Next player: ${nextPlayerName} (${xIsNext ? 'X' : 'O'})`;
    }
  };

  const boardToDisplay = viewingHistoryGame ? (viewingHistoryGame.moves[historyStep]?.board || Array(9).fill(null)) : board;
  const canClickBoard = !viewingHistoryGame && gameStatus === 'playing' && ! (gameMode === 'vsAI' && ((xIsNext && humanPlayerSymbol === 'O') || (!xIsNext && humanPlayerSymbol === 'X')));
  let lineToShow = viewingHistoryGame 
    ? (historyStep === viewingHistoryGame.moves.length - 1 && viewingHistoryGame.winner ? calculateWinner(viewingHistoryGame.moves[historyStep]?.board || [])?.line : null)
    : winningLine;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-850 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-indigo-600 dark:bg-indigo-700 text-white text-center relative">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Award className="h-8 w-8" />
            Tic Tac Toe
          </h1>
          <p className="text-indigo-200 dark:text-indigo-300 mt-1">A classic game reimagined</p>
          <div className="absolute top-4 right-4 flex gap-2">
            <ThemeSwitcher />
            <SoundToggler />
          </div>
        </div>
        <div className="p-6 md:p-8">
          {/* Removed the main grid and other potentially problematic sections for now */}
          <div className="text-center text-xl font-semibold mb-6" data-testid="status-message">
            {getStatusMessage()}
          </div>

          {/* Player Name Inputs */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
            <div className="flex-1">
              <label htmlFor="playerXName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player X Name:</label>
              <input
                type="text"
                id="playerXName"
                value={playerXName}
                onChange={(e) => setPlayerXName(e.target.value)}
                disabled={!!viewingHistoryGame || (gameMode === 'vsAI' && humanPlayerSymbol === 'O')}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="playerOName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Player O Name:</label>
              <input
                type="text"
                id="playerOName"
                value={playerOName}
                onChange={(e) => setPlayerOName(e.target.value)}
                disabled={!!viewingHistoryGame || gameMode === 'vsAI'}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Game Mode and Symbol Selection */}
          {!viewingHistoryGame && gameStatus === 'playing' && (
             <div className="my-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleSymbolChange('X')}
                        disabled={currentMoves.length > 0 || (gameMode === 'vsAI' && humanPlayerSymbol === 'O' && xIsNext)}
                        className={`py-2 px-4 rounded-lg transition-colors text-lg font-bold ${humanPlayerSymbol === 'X' ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'} ${(currentMoves.length > 0 || (gameMode === 'vsAI' && humanPlayerSymbol === 'O' && xIsNext)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Play as X"
                    >
                        Play as X
                    </button>
                    <button
                        onClick={() => handleSymbolChange('O')}
                        disabled={currentMoves.length > 0 || (gameMode === 'vsAI' && humanPlayerSymbol === 'X' && !xIsNext)}
                        className={`py-2 px-4 rounded-lg transition-colors text-lg font-bold ${humanPlayerSymbol === 'O' ? 'bg-red-500 text-white dark:bg-red-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'} ${(currentMoves.length > 0 || (gameMode === 'vsAI' && humanPlayerSymbol === 'X' && !xIsNext)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Play as O"
                    >
                        Play as O
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleGameModeChange('twoPlayer')}
                        disabled={currentMoves.length > 0}
                        className={`py-2 px-4 rounded-lg transition-colors ${gameMode === 'twoPlayer' ? 'bg-purple-500 text-white dark:bg-purple-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'} ${currentMoves.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        PvP
                    </button>
                    <button
                        onClick={() => handleGameModeChange('vsAI')}
                        disabled={currentMoves.length > 0}
                        className={`py-2 px-4 rounded-lg transition-colors ${gameMode === 'vsAI' ? 'bg-teal-500 text-white dark:bg-teal-600' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'} ${currentMoves.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        PvE (Easy)
                    </button>
                </div>
            </div>
          )}

          {/* Board or History View */}
          {viewingHistoryGame ? (
            <div className="mb-6">
              <Board board={boardToDisplay} winningLine={lineToShow} onSquareClick={() => {}} canClick={false} />
              <div className="mt-4 flex justify-center items-center gap-2">
                <button onClick={handleHistoryPrev} disabled={historyStep === 0} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50">Prev</button>
                <span>Move {historyStep + 1} / {viewingHistoryGame.moves.length}</span>
                <button onClick={handleHistoryNext} disabled={historyStep === viewingHistoryGame.moves.length - 1} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50">Next</button>
                <button onClick={handleExitHistoryView} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Exit History</button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <Board board={board} winningLine={winningLine} onSquareClick={handleClick} canClick={canClickBoard} />
            </div>
          )}
          
          {/* Reset Game / New Game Button */}
          {(gameStatus === 'won' || gameStatus === 'draw') && !viewingHistoryGame && (
            <div className="text-center mb-6">
              <button 
                onClick={() => resetGame()} 
                className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg flex items-center justify-center gap-2 mx-auto"
                aria-label="New Game"
              >
                <RefreshCw size={20} /> New Game
              </button>
            </div>
          )}

          {/* ScoreBoard and GameHistory sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreBoard stats={gameStats} playerXName={playerXName} playerOName={playerOName} gameMode={gameMode} humanPlayerSymbol={humanPlayerSymbol} />
            <GameHistory 
                history={gameHistory} 
                onViewGame={handleViewHistoricGame} 
                onResetStats={resetStats} 
                isViewingHistory={!!viewingHistoryGame} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;