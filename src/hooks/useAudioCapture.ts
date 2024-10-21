import { useRef, useState } from 'react';

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}


interface UseAudioCaptureProps {
  setTranscriptions: React.Dispatch<React.SetStateAction<Transcription[]>>;
  selectedDeviceId: string | null;
}

const useAudioCapture = ({ setTranscriptions, selectedDeviceId }: UseAudioCaptureProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [systemStream, setSystemStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  const startCapture = async () => {
    try {
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
      };

      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      const systemStreamLocal = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      setSystemStream(systemStreamLocal);

      // Crear un AudioContext
      const audioContext = new AudioContext();

      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const systemSource = audioContext.createMediaStreamSource(systemStreamLocal);

      // Crear un ChannelMergerNode con 2 entradas (canales)
      const channelMerger = audioContext.createChannelMerger(2);

      // Conectar el micrófono al canal izquierdo (input 0)
      micSource.connect(channelMerger, 0, 0);

      // Conectar el audio del sistema al canal derecho (input 0 de systemSource a input 1 del channelMerger)
      systemSource.connect(channelMerger, 0, 1);

      // Crear un nodo de destino (MediaStreamDestination)
      const destination = audioContext.createMediaStreamDestination();

      // Conectar el channelMerger al destino
      channelMerger.connect(destination);

      // El flujo combinado se obtiene del destino
      const combinedStreamLocal = destination.stream;
      setCombinedStream(combinedStreamLocal);

      console.log('llamada al websocket');
//      socketRef.current = new WebSocket('ws://localhost:8000/ws/audio');
        socketRef.current = new WebSocket('wss://cleverthera-e0e22ef57185.herokuapp.com/ws/audio');

      socketRef.current.onopen = () => {
        console.log('Conectado al servidor de WebSocket');
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { speaker, text, timestamp } = data;
      
        // Actualizar el estado de transcripciones con la marca de tiempo
        setTranscriptions((prevTranscriptions) => {
          const newTranscriptions = [
            ...prevTranscriptions,
            { speaker, text, timestamp },
          ];
      
          // Ordenar las transcripciones por marca de tiempo
          newTranscriptions.sort((a, b) => a.timestamp - b.timestamp);
      
          return newTranscriptions;
        });
      };
      

      mediaRecorderRef.current = new MediaRecorder(combinedStreamLocal, {
        mimeType: 'audio/webm; codecs=opus',
        audioBitsPerSecond: 128000, // Asegurar buena calidad
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(event.data);
        }
      };

      mediaRecorderRef.current.start(1000);
    } catch (error: any) {
      console.error('Error al capturar audio:', error);
      alert(`Error al capturar audio: ${error.name} - ${error.message}`);
    }
  };

  const stopCapture = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    micStream?.getTracks().forEach((track) => track.stop());
    systemStream?.getTracks().forEach((track) => track.stop());
    setMicStream(null);
    setSystemStream(null);
    setCombinedStream(null);
  };

  return { startCapture, stopCapture, micStream, systemStream, combinedStream };
};

export default useAudioCapture;
