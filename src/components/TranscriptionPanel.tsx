import React from "react";

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}

interface TranscriptionPanelProps {
  transcriptions: Transcription[];
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ transcriptions }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-md w-full max-h-full overflow-y-auto">
      <h2 className="text-lg text-gray-800 font-bold mb-2">Transcripción:</h2>
      {transcriptions.map((item, index) => (
        <div key={index} className="mb-2">
          <strong className="text-gray-800">{item.speaker ?? "Sistema"}:</strong>{" "}
          <span className="text-gray-800">{item.text}</span>
        </div>
      ))}
    </div>
  );
};

export default TranscriptionPanel;