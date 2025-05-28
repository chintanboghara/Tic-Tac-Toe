import React from 'react';
import { useSounds } from '../contexts/SoundContext'; // Adjust path if necessary
import { Volume2, VolumeX } from 'lucide-react'; // Import icons

const SoundToggler: React.FC = () => {
  const { isMuted, toggleMute, playSound } = useSounds();
  
  // To ensure the click sound for this button itself plays based on the state *before* toggle:
  const handleClick = () => {
    if (!isMuted) { // If it's currently NOT muted, the click to mute it SHOULD make a sound
      playSound('click');
    }
    toggleMute(); // Then toggle. If it becomes unmuted, subsequent clicks will make sounds.
                  // If it was muted and becomes unmuted, the next generic click will make a sound.
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors duration-200"
      aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
};

export default SoundToggler;
