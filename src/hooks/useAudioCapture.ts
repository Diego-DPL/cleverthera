import { useRef, useState } from "react";
// IMPORTANTE: Si no usas Supabase, quita estas referencias.
// import { supabase } from "../supabaseClient"; 

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
      // Configurar constraints
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
      };

      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      // AudioContext para (opcionalmente) combinar canales, aplicar procesado, etc.
      const audioContext = new AudioContext();
      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const destination = audioContext.createMediaStreamDestination();

      micSource.connect(destination);
      const combinedStreamLocal = destination.stream;
      setCombinedStream(combinedStreamLocal);

      // Si usas supabase y quieres validar token, descomenta:
      // const { data: { session } } = await supabase.auth.getSession();
      // const accessToken = session?.access_token;
      // if (!accessToken) {
      //   alert("No estás autenticado");
      //   return;
      // }

      // Abre WebSocket con tu backend
      socketRef.current = new WebSocket("wss://cleverthera-e0e22ef57185.herokuapp.com/ws/audio"); 
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

      mediaRecorderRef.current = new MediaRecorder(combinedStreamLocal, {
        mimeType: "audio/webm; codecs=opus",
      });

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer();
          socketRef.current.send(arrayBuffer);
        }
      };

      // Inicia la grabación y envía chunks cada 1s
      mediaRecorderRef.current.start(1000);

    } catch (error: any) {
      console.error("Error al capturar audio:", error);
      alert(`Error al capturar audio: ${error.name} - ${error.message}`);
    }
  };

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
    setCombinedStream(null);
  };

  return {
    startCapture,
    stopCapture,
    micStream,
    combinedStream,
  };
};

export default useAudioCapture;