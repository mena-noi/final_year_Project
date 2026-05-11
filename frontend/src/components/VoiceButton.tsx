import React from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

interface VoiceButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isActive,
  onClick,
  disabled = false,
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'p-2',
    medium: 'p-3',
    large: 'p-4'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        voice-button ${isActive ? 'active' : 'inactive'}
        ${sizeClasses[size]}
        ${iconSizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      aria-label={isActive ? 'Stop recording' : 'Start recording'}
      aria-pressed={isActive}
    >
      {isActive ? (
        <StopIcon className={iconSizes[size]} />
      ) : (
        <MicrophoneIcon className={iconSizes[size]} />
      )}
      <span className="sr-only">
        {isActive ? 'Stop voice recording' : 'Start voice recording'}
      </span>
    </button>
  );
};

export default VoiceButton;
