import { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

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
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  const startCapture = async () => {
    try {
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
      };

      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      const audioContext = new AudioContext();
      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const destination = audioContext.createMediaStreamDestination();

      micSource.connect(destination);

      const combinedStreamLocal = destination.stream;
      setCombinedStream(combinedStreamLocal);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('No estás autenticado');
        return;
      }

      console.log('Conectando al WebSocket');
      socketRef.current = new WebSocket('wss://cleverthera-e0e22ef57185.herokuapp.com/ws/audio');

      socketRef.current.onopen = () => {
        console.log('Conexión WebSocket establecida');
      };

      socketRef.current.onmessage = (event) => {
        console.log('Mensaje recibido del WebSocket:', event.data);
        const data = JSON.parse(event.data);
        const { speaker, text, timestamp } = data;

        setTranscriptions((prevTranscriptions) => {
          const newTranscriptions = [
            ...prevTranscriptions,
            { speaker, text, timestamp },
          ];

          newTranscriptions.sort((a, b) => a.timestamp - b.timestamp);
          return newTranscriptions;
        });
      };

      socketRef.current.onerror = (error) => {
        console.error('Error en el WebSocket:', error);
      };

      socketRef.current.onclose = (event) => {
        console.log('Conexión WebSocket cerrada:', event);
      };

      mediaRecorderRef.current = new MediaRecorder(combinedStreamLocal, {
        mimeType: 'audio/webm; codecs=opus',
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();

          // Convert audio to PCM16
          const pcm16 = await convertToPCM16(arrayBuffer);

          if (pcm16) {
            socketRef.current.send(pcm16);
          }
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
    setMicStream(null);
    setCombinedStream(null);
  };

  const convertToPCM16 = async (arrayBuffer: ArrayBuffer): Promise<ArrayBuffer | null> => {
    try {
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const offlineAudioContext = new OfflineAudioContext(
        1, // Mono
        audioBuffer.duration * 16000,
        16000 // Sample rate required for the API
      );

      const source = offlineAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineAudioContext.destination);
      source.start(0);

      const renderedBuffer = await offlineAudioContext.startRendering();
      const samples = renderedBuffer.getChannelData(0);

      const pcm16 = new Int16Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        pcm16[i] = Math.max(-1, Math.min(1, samples[i])) * 0x7fff;
      }

      return pcm16.buffer;
    } catch (error) {
      console.error('Error converting to PCM16:', error);
      return null;
    }
  };

  return { startCapture, stopCapture, micStream, combinedStream };
};

export default useAudioCapture;
