import React from 'react';

interface StartButtonProps {
  isRecording: boolean;
  onStartStop: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ isRecording, onStartStop }) => {
  return (
    <button
      onClick={onStartStop}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
    >
      {isRecording ? 'Detener Transcripción' : 'Iniciar Transcripción'}
    </button>
  );
};

export default StartButton;
