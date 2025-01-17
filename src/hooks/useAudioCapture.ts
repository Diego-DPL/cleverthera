import { useRef, useState } from "react";

interface UseAudioCaptureProps {
  setTranscriptions: React.Dispatch<React.SetStateAction<string | null>>;
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
        video: false,
      };
      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      const systemStreamLocal = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true,
      });
      setSystemStream(systemStreamLocal);

      const systemAudioTracks = systemStreamLocal.getAudioTracks();
      const systemAudioStream = new MediaStream(systemAudioTracks);

      const audioContext = new AudioContext();
      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const systemSource = audioContext.createMediaStreamSource(systemAudioStream);

      const destination = audioContext.createMediaStreamDestination();
      micSource.connect(destination);
      systemSource.connect(destination);

      const combinedStreamLocal = destination.stream;
      setCombinedStream(combinedStreamLocal);

      socketRef.current = new WebSocket("wss://api.cleverthera.com/ws/audio");
      socketRef.current.onopen = () => {
        console.log("Conexión WebSocket establecida con el backend");
      };
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { transcription } = data; // Usamos una única transcripción
          setTranscriptions(transcription || null);
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

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error al capturar audio:", error);
      alert(`Error al capturar audio: ${error}`);
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
