import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext'; // Adjust path as per your project structure

// Test component to consume the theme context
const TestConsumerComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-name">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-button">Toggle Theme</button>
    </div>
  );
};

describe('ThemeProvider and useTheme Hook', () => {
  // Test Case 1: Default Theme and Toggling
  test('initializes with "light" theme, toggles to "dark" and back, and updates <html> class', () => {
    render(
      <ThemeProvider>
        <TestConsumerComponent />
      </ThemeProvider>
    );

    // Initial state: light theme
    expect(screen.getByTestId('theme-name').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // First toggle: to dark theme
    act(() => {
      screen.getByTestId('toggle-button').click();
    });
    expect(screen.getByTestId('theme-name').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Second toggle: back to light theme
    act(() => {
      screen.getByTestId('toggle-button').click();
    });
    expect(screen.getByTestId('theme-name').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  // Test Case 2: useTheme outside ThemeProvider
  test('useTheme throws an error if used outside of a ThemeProvider', () => {
    // Suppress console.error output for this specific test
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect render to throw the specific error
    expect(() => {
      render(<TestConsumerComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    // Restore original console.error
    console.error = originalConsoleError;
  });
});
