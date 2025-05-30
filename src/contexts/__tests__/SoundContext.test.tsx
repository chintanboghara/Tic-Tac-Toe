import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom'; // For .toBeInTheDocument() and other matchers
import { SoundProvider, useSounds } from '../SoundContext'; // Adjust path

// Test component to consume the context
const TestSoundConsumer = () => {
  const { playSound, isMuted, toggleMute } = useSounds();
  return (
    <div>
      <span data-testid="isMuted">{isMuted.toString()}</span>
      <button onClick={() => playSound('move')} data-testid="playSoundMove">Play Move</button>
      <button onClick={toggleMute} data-testid="toggleMute">Toggle Mute</button>
    </div>
  );
};

import { vi } from 'vitest';

describe('SoundProvider and useSounds', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let localStorageGetItemSpy: ReturnType<typeof vi.spyOn>;
  let localStorageSetItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Mock localStorage
    localStorageGetItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    localStorageSetItemSpy = vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    localStorageGetItemSpy.mockRestore();
    localStorageSetItemSpy.mockRestore();
    localStorage.clear(); // Clear localStorage for other tests
  });

  test('initializes with default mute state (false) and toggles correctly, updating localStorage', () => {
    localStorageGetItemSpy.mockReturnValue(null); // No stored state

    render(
      <SoundProvider>
        <TestSoundConsumer />
      </SoundProvider>
    );

    expect(screen.getByTestId('isMuted').textContent).toBe('false');

    act(() => {
      screen.getByTestId('toggleMute').click();
    });
    expect(screen.getByTestId('isMuted').textContent).toBe('true');
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('ticTacToeMute', 'true');

    act(() => {
      screen.getByTestId('toggleMute').click();
    });
    expect(screen.getByTestId('isMuted').textContent).toBe('false');
    expect(localStorageSetItemSpy).toHaveBeenCalledWith('ticTacToeMute', 'false');
  });

  test('playSound respects mute state', () => {
    localStorageGetItemSpy.mockReturnValue(null); // Start with sounds unmuted
    render(
      <SoundProvider>
        <TestSoundConsumer />
      </SoundProvider>
    );

    // Sounds are on by default
    act(() => {
      screen.getByTestId('playSoundMove').click();
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Playing sound: move');
    consoleLogSpy.mockClear(); // Clear spy for next assertion

    // Toggle mute to true (sounds off)
    act(() => {
      screen.getByTestId('toggleMute').click();
    });
    act(() => {
      screen.getByTestId('playSoundMove').click();
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Sound playing SKIPPED (muted): move');
  });

  test('initializes mute state from localStorage if present (e.g., "true")', () => {
    localStorageGetItemSpy.mockReturnValue('true'); // Muted state stored
    render(
      <SoundProvider>
        <TestSoundConsumer />
      </SoundProvider>
    );
    expect(screen.getByTestId('isMuted').textContent).toBe('true');
  });

  test('initializes mute state from localStorage if present (e.g., "false")', () => {
    localStorageGetItemSpy.mockReturnValue('false'); // Unmuted state stored
    render(
      <SoundProvider>
        <TestSoundConsumer />
      </SoundProvider>
    );
    expect(screen.getByTestId('isMuted').textContent).toBe('false');
  });
  
  test('useSounds should throw error when not used within SoundProvider', () => {
    // Suppress console.error for this specific test, as React will log the error boundary
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestSoundConsumer />)).toThrow('useSounds must be used within a SoundProvider');
    
    consoleErrorMock.mockRestore(); // Restore original console.error
  });
});
