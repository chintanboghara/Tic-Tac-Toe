import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'; // Adjust path
import ThemeSwitcher from '../ThemeSwitcher'; // Adjust path
import { Sun, Moon } from 'lucide-react'; // To help identify icons if needed

import { vi } from 'vitest';

// Mock Lucide icons for easier testing if direct icon comparison is complex
// This approach checks for the presence of the icon component name.
// If you need to check specific SVG paths, a different mocking strategy would be needed.
vi.mock('lucide-react', async (importOriginal) => {
  const originalModule = await importOriginal() as any; // Cast to any or define a more specific type
  return {
    ...originalModule,
    Moon: () => <svg data-testid="moon-icon" />,
    Sun: () => <svg data-testid="sun-icon" />,
  };
});

describe('ThemeSwitcher Component', () => {
  // Test Case 1: Initial Display and Toggling
  test('initially displays Moon icon, correct aria-label, and toggles to Sun icon with updated label and theme', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // Initial state (light theme)
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to toggle to dark theme
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });

    // After toggle (dark theme)
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light theme');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  // Test Case 2: Toggling Back
  test('toggles back to Moon icon, correct aria-label, and light theme on second click', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );

    // First click (to dark)
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });
    
    // Sanity check: should be dark now
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Second click (back to light)
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });

    // After second toggle (light theme)
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
