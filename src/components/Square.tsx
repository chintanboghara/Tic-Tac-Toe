import React from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinningSquare: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare }) => {
  const baseClasses = "w-full h-20 text-4xl font-bold flex items-center justify-center rounded-md transition-all duration-200";
  
  // Different styling based on value and winning status
  const getSquareClasses = () => {
    if (isWinningSquare) {
      return `${baseClasses} bg-green-200 text-green-800 border-2 border-green-500 dark:bg-green-700 dark:text-green-100 dark:border-green-500`;
    }
    
    if (!value) {
      return `${baseClasses} bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer`;
    }
    
    if (value === 'X') {
      return `${baseClasses} bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300`;
    }
    
    // For 'O'
    return `${baseClasses} bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300`;
  };

  return (
    <button
      className={getSquareClasses()}
      onClick={onClick}
      aria-label={value ? `Square with ${value}` : "Empty square"}
    >
      {value}
    </button>
  );
};

export default Square;