import { useRef, useState } from "react";

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

  // Streams en el frontend
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [systemStream, setSystemStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  const startCapture = async () => {
    try {
      // 1) Capturar micrófono
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
        video: false,
      };
      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      // 2) Capturar audio del sistema
      //    (Chrome te pedirá "Compartir pestaña" o "Pantalla" con casilla de audio)
      const systemStreamLocal = await navigator.mediaDevices.getDisplayMedia({
        audio: true, 
        video: true, // A veces es necesario "true" para que aparezca la opción de "compartir audio".
      });
      setSystemStream(systemStreamLocal);

      // 3) EXTRAER solo las pistas de audio del systemStreamLocal,
      //    ignorando el track de video. Así nos quedamos con puramente audio.
      const systemAudioTracks = systemStreamLocal.getAudioTracks();
      const systemAudioStream = new MediaStream(systemAudioTracks);

      // 4) Crear un AudioContext para mezclar mic + sistema en un único stream.
      const audioContext = new AudioContext();

      // Crear sources solo con audio
      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const systemSource = audioContext.createMediaStreamSource(systemAudioStream);

      // Destino donde se mezclan todas las fuentes
      const destination = audioContext.createMediaStreamDestination();

      micSource.connect(destination);
      systemSource.connect(destination);

      // Este stream final NO tiene vídeo, solo audio mezclado
      const combinedStreamLocal = destination.stream;
      setCombinedStream(combinedStreamLocal);

      // 5) Iniciar WebSocket
      socketRef.current = new WebSocket("wss://api.cleverthera.com/ws/audio");
      socketRef.current.onopen = () => {
        console.log("Conexión WebSocket establecida con el backend");
      };
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { speaker, text, timestamp } = data;
          setTranscriptions((prev) => {
            const newTranscriptions = [...prev, { speaker, text, timestamp }];
            newTranscriptions.sort((a, b) => a.timestamp - b.timestamp);
            return newTranscriptions;
          });
        } catch (err) {
          console.error("Error parseando mensaje de WebSocket:", err);
        }
      };
      socketRef.current.onerror = (error) => {
        console.error("Error en el WebSocket:", error);
      };
      socketRef.current.onclose = (event) => {
        console.log("Conexión WebSocket cerrada:", event);
      };

      // 6) Crear el MediaRecorder SOLO con el stream combinado de audio
      mediaRecorderRef.current = new MediaRecorder(combinedStreamLocal, {
        mimeType: "audio/webm; codecs=opus",
      });

      // Cada vez que se genere un chunk, lo enviamos por WS
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          socketRef.current.send(arrayBuffer);
        }
      };

      // Iniciar la grabación, enviando chunks cada 1s
      mediaRecorderRef.current.start(3000);

    } catch (error) {
      console.error("Error al capturar audio:", error);
      alert(`Error al capturar audio: ${error}`);
    }
  };

  // Detener la captura
  const stopCapture = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }

    if (systemStream) {
      systemStream.getTracks().forEach((track) => track.stop());
      setSystemStream(null);
    }

    setCombinedStream(null);
  };

  return {
    startCapture,
    stopCapture,
    micStream,
    systemStream,
    combinedStream,
  };
};

export default useAudioCapture;