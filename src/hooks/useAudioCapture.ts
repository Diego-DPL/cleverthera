import { useRef, useState } from "react";

// Tipo de transcripción (adaptado a lo que muestras en tu TranscriptionPanel)
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
  // Referencias a RTCPeerConnection y DataChannel
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Streams locales
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [systemStream, setSystemStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  // Iniciar la captura y la conexión con Realtime (WebRTC)
  const startCapture = async () => {
    try {
      // 1) Pedir ephemeral key a tu backend python
      const resp = await fetch("https://cleverthera-e0e22ef57185.herokuapp.com/session"); 
      // O "http://localhost:8000/session" si local
      if (!resp.ok) throw new Error("Error al obtener ephemeral key");
      const data = await resp.json();
      const ephemeralKey = data.client_secret.value;
      if (!ephemeralKey) throw new Error("No se recibió client_secret.value");

      // 2) Crear RTCPeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3) Capturar micrófono (con selectedDeviceId si se eligió)
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
        video: false,
      };
      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      // 4) Capturar audio del sistema/pestaña
      const systemStreamLocal = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true, // Chrome suele exigir video:true para permitir audio
      });
      setSystemStream(systemStreamLocal);

      // 5) Agregar tracks al PeerConnection:
      //    - mic
      micStreamLocal.getTracks().forEach((track) => {
        pc.addTrack(track, micStreamLocal);
      });
      //    - system
      systemStreamLocal.getTracks().forEach((track) => {
        pc.addTrack(track, systemStreamLocal);
      });

      // 6) Crear DataChannel para recibir y enviar eventos
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log("DataChannel (oai-events) abierto.");
      };

      dc.onmessage = (e) => {
        // Mensajes del Realtime (JSON)
        try {
          const msg = JSON.parse(e.data);
          console.log("Evento Realtime:", msg);
          // Si vienen “transcripts” o contenido textual, lo agregas a tu panel
          // Ejemplo: msg.type === "conversation.item.created", etc.
          // Asumiendo algo:
          if (msg.text) {
            setTranscriptions((prev) => {
              const newT = [
                ...prev,
                {
                  speaker: msg.speaker || "Modelo",
                  text: msg.text,
                  timestamp: msg.timestamp || Date.now(),
                },
              ];
              newT.sort((a, b) => a.timestamp - b.timestamp);
              return newT;
            });
          }
        } catch (err) {
          console.error("No se pudo parsear el mensaje Realtime:", e.data);
        }
      };

      // 7) Por si el Realtime envía audio TTS, podemos reproducirlo
      pc.ontrack = (event) => {
        // event.streams[0] es la pista de audio TTS del modelo
        console.log("ontrack remoto - modelo TTS");
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.autoplay = true;
      };

      // 8) Creamos oferta SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 9) Enviar esa oferta a la Realtime API con la ephemeral key
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17"; // Ajusta a tu modelo
      const sdpResp = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });
      if (!sdpResp.ok) {
        throw new Error("Error al obtener SDP answer de Realtime: " + (await sdpResp.text()));
      }
      const answerSDP = await sdpResp.text();
      const answerDesc: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSDP,
      };
      await pc.setRemoteDescription(answerDesc);
      console.log("Conexión WebRTC establecida con Realtime.");

      // Guardamos un “combined” informativo (mic + sys),
      // pero en realidad la mezcla la gestiona Realtime.
      // Si quieres un simple visualizador, crea un AudioContext local.
      const audioContext = new AudioContext();
      const micSource = audioContext.createMediaStreamSource(micStreamLocal);
      const sysSource = audioContext.createMediaStreamSource(systemStreamLocal);
      const destination = audioContext.createMediaStreamDestination();
      micSource.connect(destination);
      sysSource.connect(destination);

      setCombinedStream(destination.stream);
    } catch (error) {
      console.error("Error en startCapture:", error);
      alert("Error iniciando Realtime: " + (error as Error).message);
    }
  };

  // Detener la conexión
  const stopCapture = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
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
    console.log("Conexión Realtime detenida.");
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