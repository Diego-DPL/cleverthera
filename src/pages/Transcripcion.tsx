import React, { useState } from 'react';
import StartButton from '../components/StartButton';
import TranscriptionPanel from '../components/TranscriptionPanel';
import AudioDeviceSelector from '../components/AudioDeviceSelector';
import AudioVisualizer from '../components/AudioVisualizer';
import useAudioCapture from '../hooks/useAudioCapture';
import useAuth from '../hooks/useAuth';



interface Transcription {
    speaker?: string;
    text: string;
    timestamp: number;
}


const Transcripcion: React.FC = () => {

    const user = useAuth();
    console.log('Transcipcion-> user ', user);
    
    if (!user) {
        return <div>Loading...</div>;  // Muestra un mensaje de carga mientras se verifica la autenticación
    }

    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    const { startCapture, stopCapture, micStream, systemStream, combinedStream} = useAudioCapture({
        setTranscriptions,
        selectedDeviceId,
    });

    const handleStartStop = () => {
        if (isRecording) {
        stopCapture();
        } else {
        startCapture();
        }
        setIsRecording(!isRecording);
    };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl text-gray-800 font-bold mb-8">Transcripción de Pacientes</h1>
      <AudioDeviceSelector
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
      />
      <StartButton isRecording={isRecording} onStartStop={handleStartStop} />
      {micStream && (
        <div>
          <h3 className='text-gray-800'>Visualización del Micrófono</h3>
          <AudioVisualizer stream={micStream} />
        </div>
      )}
      {systemStream && (
        <div>
          <h3 className='text-gray-800'>Visualización del Audio del Sistema</h3>
          <AudioVisualizer stream={systemStream} />
        </div>
      )}
      {combinedStream && (
        <div>
          <h3 className='text-gray-800'>Visualización del Audio Combinado</h3>
          <AudioVisualizer stream={combinedStream} />
        </div>
      )}
      <TranscriptionPanel transcriptions={transcriptions} />
    </div>
  );
};

export default Transcripcion;
