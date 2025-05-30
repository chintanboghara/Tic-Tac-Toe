import React from 'react';
import Square from './Square';
import { PlayerSymbol } from '../types';
import { X, O } from 'lucide-react'; // Assuming X and O components are needed by Square if not already imported there

interface BoardProps {
  board: (PlayerSymbol | null)[];
  winningLine: number[] | null;
  onSquareClick: (index: number) => void;
  canClick: boolean;
}

const Board: React.FC<BoardProps> = ({ board: squares, winningLine, onSquareClick, canClick }) => {
  // Ensure squares is an array before mapping. If not, provide a default or throw a more specific error.
  // However, TypeScript should enforce that `squares` is `(PlayerSymbol | null)[]`.
  // The error "Cannot read properties of undefined (reading '0')" implies `squares` is undefined at `squares[0]`.

  if (!squares) {
    // This condition should ideally not be met if props are passed correctly.
    // Adding a log here might help if tests are re-run in a future session.
    console.error("Board_tsx: 'squares' prop is undefined or null!");
    return <div className="text-red-500">Error: Board data is missing.</div>; // Fallback UI
  }

  return (
    <div className={`grid grid-cols-3 gap-1 w-full aspect-square max-w-sm mx-auto rounded-lg shadow-inner p-1 bg-gray-200 dark:bg-gray-700`}>
      {squares.map((squareValue, i) => {
        // If squares was undefined, .map() would have thrown "Cannot read properties of undefined (reading 'map')"
        // So, if we are here, squares is an array.
        // The error must be that `squares` becomes undefined somehow between the .map call and this callback execution,
        // or that the `squares` variable in this scope is shadowed or incorrect.
        // Given it's a prop, this is highly unusual.
        const isWinningSquare = winningLine ? winningLine.includes(i) : false;
        return (
          <Square
            key={i} // Added key for list items
            value={squareValue} // Use the mapped value directly
            onClick={() => onSquareClick(i)}
            isWinningSquare={isWinningSquare}
            ariaLabel={`Square ${i}`}
            disabled={!canClick || !!squares[i]}
          />
        );
      })}
    </div>
  );
};

export default Board;