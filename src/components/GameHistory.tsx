import React from 'react';
import { History, Clock } from 'lucide-react';
import { HistoricGame, PlayerSymbol } from '../../types'; // Import HistoricGame and PlayerSymbol

interface GameHistoryProps {
  history: HistoricGame[];
  onViewHistoricGame: (game: HistoricGame) => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ history, onViewHistoricGame }) => {
  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Get result text based on winner
  const getResultText = (winner: PlayerSymbol | null) => {
    if (winner) {
      return `Player ${winner} won`;
    }
    return "Draw";
  };

  // Get appropriate color class based on winner
  const getResultColorClass = (winner: PlayerSymbol | null) => {
    if (winner === 'X') return 'text-indigo-600 dark:text-indigo-400';
    if (winner === 'O') return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-300';
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
        <History className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        Game History
      </h2>
      
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No games played yet</p>
        ) : (
          [...history].map((game) => { // Display in order received (App.tsx prepends, so it's already reversed)
            const finalBoardState = game.moves.length > 0 ? game.moves[game.moves.length - 1].board : Array(9).fill(null);
            return (
              <button
                key={game.id}
                onClick={() => onViewHistoricGame(game)}
                className="w-full text-left p-2 bg-white dark:bg-slate-750 rounded border border-gray-200 dark:border-slate-650 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150 block"
                aria-label={`View details for game played on ${formatDate(new Date(game.date))}`} // Ensure game.date is a Date object
              >
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className={`font-medium ${getResultColorClass(game.winner)}`}>
                    {getResultText(game.winner)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    {formatDate(new Date(game.date))} {/* Ensure game.date is a Date object */}
                  </span>
                </div>
                {/* Mini-board display */}
                <div 
                  className="mt-2 grid grid-cols-3 gap-0.5 w-14 h-14 sm:w-16 sm:h-16 border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 p-0.5 rounded"
                  data-testid="mini-board-display"
                >
                  {finalBoardState.map((square, i) => (
                    <div
                      key={i}
                      className={`w-full h-full flex items-center justify-center text-lg font-bold rounded-sm
                                  ${square === 'X' ? 'text-indigo-500 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-800' :
                                    square === 'O' ? 'text-purple-500 bg-purple-100 dark:text-purple-400 dark:bg-purple-800' :
                                    'bg-gray-200 dark:bg-slate-600'}`}
                    >
                      {square || ''}
                    </div>
                  ))}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameHistory;