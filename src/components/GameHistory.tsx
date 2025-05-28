import React from 'react';
import { History, Clock } from 'lucide-react';

interface GameHistoryProps {
  history: Array<{
    winner: string | null;
    board: Array<string | null>;
    date: Date;
  }>;
}

const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Get result text based on winner
  const getResultText = (winner: string | null) => {
    if (winner) {
      return `Player ${winner} won`;
    }
    return "Draw";
  };

  // Get appropriate color class based on winner
  const getResultColorClass = (winner: string | null) => {
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
      
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1"> {/* Consider dark scrollbar styles if needed, though browser default is often fine */}
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">No games played yet</p>
        ) : (
          [...history].reverse().map((game, index) => (
            <div key={index} className="p-2 bg-white dark:bg-slate-750 rounded border border-gray-200 dark:border-slate-650 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-medium ${getResultColorClass(game.winner)}`}>
                  {getResultText(game.winner)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" /> {/* Explicitly color the icon */}
                  {formatDate(game.date)}
                </span>
              </div>
              {/* Mini-board display */}
              <div className="mt-2 grid grid-cols-3 gap-0.5 w-16 h-16 border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 p-0.5 rounded">
                {game.board.map((square, i) => (
                  <div
                    key={i}
                    className={`w-full h-full flex items-center justify-center text-lg font-bold rounded-sm
                                ${square === 'X' ? 'text-indigo-500 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-800' :
                                  square === 'O' ? 'text-purple-500 bg-purple-100 dark:text-purple-400 dark:bg-purple-800' :
                                  'bg-gray-200 dark:bg-slate-600'}`}
                  >
                    {square}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameHistory;