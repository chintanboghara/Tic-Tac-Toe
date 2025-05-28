import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App'; // Adjust path as necessary

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
