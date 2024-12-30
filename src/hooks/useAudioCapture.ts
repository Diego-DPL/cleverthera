import { useRef, useState } from "react";

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}

interface UseRealtimeCaptureProps {
  setTranscriptions: React.Dispatch<React.SetStateAction<Transcription[]>>;
  selectedDeviceId: string | null;
}

const useRealtimeCapture = ({ setTranscriptions, selectedDeviceId }: UseRealtimeCaptureProps) => {
  // PeerConnection y DataChannel
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  // Streams locales
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [systemStream, setSystemStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);

  // Inicia todo
  const startCapture = async () => {
    try {
      // 1) Pedir ephemeral key a tu backend (Python en Heroku o donde sea)
      const resp = await fetch("https://TU_BACKEND_DOMAIN/session"); 
      // Ej: "https://my-cleverthera-backend.herokuapp.com/session"
      if (!resp.ok) throw new Error("Error al obtener ephemeral key");
      const data = await resp.json();
      const ephemeralKey = data?.client_secret?.value;
      if (!ephemeralKey) {
        throw new Error("No se recibió client_secret.value en /session");
      }

      // 2) Crear PeerConnection
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // 3) Capturar micrófono
      const audioConstraints: MediaStreamConstraints = {
        audio: selectedDeviceId ? { deviceId: selectedDeviceId } : true,
        video: false,
      };
      const micStreamLocal = await navigator.mediaDevices.getUserMedia(audioConstraints);
      setMicStream(micStreamLocal);

      // 4) Capturar audio del sistema/pantalla
      const systemStreamLocal = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true, // Chrome exige video:true para permitir audio
      });
      setSystemStream(systemStreamLocal);

      // 5) Añadir tracks al PeerConnection
      micStreamLocal.getTracks().forEach((track) => {
        pc.addTrack(track, micStreamLocal);
      });
      systemStreamLocal.getTracks().forEach((track) => {
        pc.addTrack(track, systemStreamLocal);
      });

      // 6) Crear DataChannel para mandar/recibir eventos
      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;

      // Al abrir el dataChannel, podemos mandar un "session.update" adicional, si queremos
      // (No es estrictamente necesario si /session ya configuró todo,
      //  pero aquí mostramos cómo forzar la transcripción).
      dc.onopen = () => {
        console.log("DataChannel (oai-events) abierto, configurando session...");
        const sessionUpdate = {
          type: "session.update",
          session: {
            // Aseguramos que se transcriba el audio
            modalities: ["audio", "text"],
            input_audio_format: "pcm16",
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
              create_response: false
            },
            temperature: 0.0,
            max_response_output_tokens: "inf",
          },
        };
        dc.send(JSON.stringify(sessionUpdate));
      };

      // Mensajes de la API Realtime
      dc.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("Evento Realtime:", msg);

          // Cuando la VAD detecta fin de habla, crea un "conversation.item.created"
          // que contiene "content[].transcript".
          if (msg.type === "conversation.item.created") {
            const item = msg.item;
            if (item?.type === "message" && item?.content) {
              // Normalmente item.content[0].transcript
              const contentPart = item.content[0];
              if (contentPart?.transcript) {
                const transcriptText = contentPart.transcript.trim();
                setTranscriptions((prev) => {
                  const newT = [
                    ...prev,
                    {
                      speaker: "Audio mezclado",
                      text: transcriptText,
                      timestamp: Date.now(),
                    },
                  ];
                  newT.sort((a, b) => a.timestamp - b.timestamp);
                  return newT;
                });
              }
            }
          }

          // Podrías capturar más eventos, p.e. "input_audio_buffer.speech_started",
          // "response.audio_transcript.delta", etc.
        } catch (err) {
          console.error("No se pudo parsear evento Realtime:", event.data);
        }
      };

      dc.onerror = (err) => {
        console.error("DataChannel error:", err);
      };

      // 7) PeerConnection: en caso de audio TTS remoto (si "create_response": true)
      pc.ontrack = (e) => {
        console.log("Remoto track TTS (si el modelo habla).");
        // Si quisieras reproducirlo:
        const remoteAudio = new Audio();
        remoteAudio.srcObject = e.streams[0];
        remoteAudio.autoplay = true;
      };

      // 8) Crear offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 9) Mandar la oferta a la API Realtime
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17"; // Ajusta si difiere
      const sdpResp = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });
      if (!sdpResp.ok) {
        throw new Error("Error en SDP answer: " + (await sdpResp.text()));
      }
      const answerSDP = await sdpResp.text();
      const remoteDesc: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSDP,
      };
      await pc.setRemoteDescription(remoteDesc);
      console.log("Conexión WebRTC establecida con Realtime.");

      // 10) (Opcional) Crear un stream "combinado" local para tu AudioVisualizer
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

  // Detener y limpiar
  const stopCapture = () => {
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
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

export default useRealtimeCapture;