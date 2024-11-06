import React from 'react';

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}

interface TranscriptionPanelProps {
  transcriptions: Transcription[];
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ transcriptions }) => {

  console.log('Transcripciones recibidas:', transcriptions);

  return (   
    <div className="bg-white p-4 rounded-md shadow-md w-3/4 h-3/4 max-h-screen overflow-y-auto mt-4">
      <h2 className="text-lg text-gray-800 font-bold mb-2">Transcripcion:</h2>
      {transcriptions.map((transcription, index) => (
        <div key={index} className="mb-2">
          <strong className='text-gray-800'>{transcription.speaker}:</strong> <span className='text-gray-800'>{transcription.text}</span>
        </div>
      ))}
    </div>
  );
};

export default TranscriptionPanel;
