import React, { StrictMode } from 'react'; // Import React
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider
import { SoundProvider } from './contexts/SoundContext'; // Import SoundProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <App />
      </SoundProvider>
    </ThemeProvider>
  </StrictMode>
);
