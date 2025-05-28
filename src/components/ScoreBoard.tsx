import React from 'react';
import { Trophy, User, Users, Hash, Bot } from 'lucide-react';
import { GameStats } from '../../types'; // Import GameStats

interface ScoreBoardProps {
  stats: GameStats;
  playerXName: string;
  playerOName: string; // Will be "Easy AI" in PvA mode
  gameMode: 'twoPlayer' | 'vsAI';
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats, playerXName, playerOName, gameMode }) => {
  const currentModeStats = gameMode === 'twoPlayer' ? stats.pvp : stats.pva;
  const playerXDisplayName = gameMode === 'twoPlayer' ? playerXName : `${playerXName} (You)`;
  const playerODisplayName = gameMode === 'twoPlayer' ? playerOName : "Easy AI";

  return (
    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Score Board
      </h2>
      
      <div className="space-y-2">
        {/* Total Games Played */}
        <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/50 rounded">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-700 dark:text-blue-300">Total Games</span>
          </div>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalGamesPlayed}</span>
        </div>

        {/* Mode-Specific Stats */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">
            {gameMode === 'twoPlayer' ? 'Player vs Player' : 'Player vs AI'}
          </h3>

          {/* Player X / Human Player */}
          <div className="flex justify-between items-center p-2 bg-indigo-50 dark:bg-indigo-900/50 rounded mb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-medium text-indigo-700 dark:text-indigo-300">
                {playerXDisplayName}
              </span>
            </div>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {gameMode === 'twoPlayer' ? (currentModeStats as GameStats['pvp']).X : (currentModeStats as GameStats['pva']).playerXWins}
            </span>
          </div>
          
          {/* Player O / AI */}
          <div className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900/50 rounded mb-2">
            <div className="flex items-center gap-2">
              {gameMode === 'twoPlayer' ? 
                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" /> : 
                <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
              <span className="font-medium text-purple-700 dark:text-purple-300">
                {playerODisplayName}
              </span>
            </div>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {gameMode === 'twoPlayer' ? (currentModeStats as GameStats['pvp']).O : (currentModeStats as GameStats['pva']).aiOWins}
            </span>
          </div>
          
          {/* Draws for the current mode */}
          <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-slate-700 rounded">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Draws</span>
            </div>
            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {currentModeStats.draws}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;