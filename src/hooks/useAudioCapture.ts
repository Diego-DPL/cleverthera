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
  // Referencias para el MediaRecorder y el WebSocket
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // States para cada stream
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [systemStream, setSystemStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  // Función para iniciar la captura
  const startCapture = async () => {
    try {
      // 1) Capturar MICRÓFONO
      //    Usamos selectedDeviceId si el usuario escogió un mic específico.
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
        video: false,
      };
      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      // 2) Capturar AUDIO DEL SISTEMA/PANTALLA
      //    getDisplayMedia con audio. Chrome te pedirá "Compartir pestaña" o "Pantalla"
      //    Asegúrate de que el usuario seleccione la casilla "compartir audio"
      const systemStreamLocal = await navigator.mediaDevices.getDisplayMedia({
        audio: true, // para que incluya el audio del sistema
        video: true, // a veces Chrome exige video=true para permitir audio
      });
      setSystemStream(systemStreamLocal);

      // 3) Combinamos ambos streams en un AudioContext
      //    para tener un único "combinedStream".
      const audioContext = new AudioContext();

      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const systemSource = audioContext.createMediaStreamSource(systemStreamLocal);

      const destination = audioContext.createMediaStreamDestination();

      // Conectar micrófono
      micSource.connect(destination);
      // Conectar audio del sistema
      systemSource.connect(destination);

      const combinedStreamLocal = destination.stream;
      setCombinedStream(combinedStreamLocal);

      // 4) Abrir WebSocket al backend (FastAPI + ChatGPT Realtime)
      socketRef.current = new WebSocket("wss://api.cleverthera.com/ws/audio"); 
      socketRef.current.onopen = () => {
        console.log("Conexión WebSocket establecida con el backend");
      };
      socketRef.current.onmessage = (event) => {
        // Mensajes de transcripción recibidos
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

      // 5) Iniciar MediaRecorder con el stream combinado
      mediaRecorderRef.current = new MediaRecorder(combinedStreamLocal, {
        mimeType: "audio/webm; codecs=opus",
      });

      // Cada vez que haya un chunk de audio, lo enviamos por WS
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          socketRef.current.send(arrayBuffer);
        }
      };

      // Inicia la grabación, enviando chunks cada 1s
      mediaRecorderRef.current.start(1000);

    } catch (error) {
      console.error("Error al capturar audio:", error);
      alert(`Error al capturar audio: ${error}`);
    }
  };

  // Función para detener la captura
  const stopCapture = () => {
    // 1) Detener la grabación
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // 2) Cerrar WebSocket
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    // 3) Detener tracks de micrófono
    if (micStream) {
      micStream.getTracks().forEach((track) => track.stop());
      setMicStream(null);
    }

    // 4) Detener tracks de sistema
    if (systemStream) {
      systemStream.getTracks().forEach((track) => track.stop());
      setSystemStream(null);
    }

    // 5) Vaciar combinedStream
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