import React, { useEffect, useState } from 'react';

interface SquareProps {
  value: string | null;
  onClick: () => void;
  isWinningSquare: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare }) => {
  const [animatedValue, setAnimatedValue] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setAnimatedValue(value);
    } else {
      setAnimatedValue(null); // Reset if square is cleared
    }
  }, [value]);

  const baseClasses = "w-full h-20 text-4xl font-bold flex items-center justify-center rounded-md transition-all duration-200";
  
  const getSquareClasses = () => {
    let classes = baseClasses;
    if (isWinningSquare) {
      classes += ' bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100 border-2 border-green-500 dark:border-green-500';
      classes += ' animate-pulse-bg-winner'; // Add the winning animation class
    } else if (!animatedValue) { // Use animatedValue for styling empty
      classes += ' bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer';
    } else if (animatedValue === 'X') {
      classes += ' bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300';
    } else { // 'O'
      classes += ' bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300';
    }
    
    // Add X/O placement animation class if value is present (X or O) AND it's not a winning square already
    // (to avoid re-animating if the board state loads with a win)
    if (animatedValue && !isWinningSquare) {
      classes += ' animate-scale-in'; 
    }
    return classes;
  };

  return (
    <button
      className={getSquareClasses()}
      onClick={onClick}
      aria-label={value ? `Square with ${value}` : "Empty square"}
    >
      {value} {/* Display the actual value, not animatedValue, to show it immediately */}
    </button>
  );
};

export default Square;