import React from 'react';
import { Trophy, User, Users } from 'lucide-react';

interface ScoreBoardProps {
  scores: {
    X: number;
    O: number;
    draws: number;
  };
  playerXName: string;
  playerOName: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, playerXName, playerOName }) => {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" /> {/* Icon color can remain or be adjusted if needed dark:text-yellow-400 */}
        Score Board
      </h2>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center p-2 bg-indigo-50 dark:bg-indigo-900 rounded">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-indigo-600 dark:text-indigo-300">{playerXName}</span>
          </div>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-300">{scores.X}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900 rounded">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-600 dark:text-purple-300">{playerOName}</span>
          </div>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-300">{scores.O}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-slate-700 rounded">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            <span className="font-medium text-gray-600 dark:text-slate-300">Draws</span>
          </div>
          <span className="text-lg font-bold text-gray-600 dark:text-slate-300">{scores.draws}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;