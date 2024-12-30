import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Mic, StopCircle } from "lucide-react";

import useAudioCapture from "../hooks/useAudioCapture";
import useAuth from "../hooks/useAuth";  
import AudioVisualizer from "../components/AudioVisualizer";
import TranscriptionPanel from "../components/TranscriptionPanel";

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}

export default function TranscriptionPage() {
  const user = useAuth(); // Ajusta o elimina si no usas este hook de autenticación
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

  // Dispositivo de micrófono seleccionado (opcional si quieres elegir micro en el dropdown)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Controla si estamos grabando / transcribiendo
  const [isRecording, setIsRecording] = useState(false);

  // Lista de micrófonos disponibles
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  // Streams para visualización (opcional) 
  const { 
    startCapture,
    stopCapture,
    micStream, 
    systemStream,
    combinedStream
  } = useAudioCapture({
    setTranscriptions,
    selectedDeviceId,
  });

  // Al montar el componente, enumeramos micrófonos (para el <Select>)
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const audioInputs = devices.filter(
          (device) => device.kind === "audioinput" && device.deviceId.trim() !== ""
        );
        setAudioDevices(audioInputs);
      })
      .catch((err) => console.error("Error al enumerar dispositivos:", err));
  }, []);

  // Al pulsar el botón de Iniciar/Detener
  const handleStartStop = async () => {
    if (isRecording) {
      stopCapture();
    } else {
      // Comenzar la captura: 
      // 1) pedir micrófono
      // 2) pedir system audio
      // 3) combinar y enviar a ChatGPT Realtime
      await startCapture();
    }
    setIsRecording(!isRecording);
  };

  if (user === null) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col w-screen min-h-screen p-4 space-y-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-center mb-8">Transcripción de Sesión (Audio Mic + Sistema)</h1>

      {/* Configuración de Audio */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropdown con micrófonos disponibles */}
          <Select onValueChange={(value) => setSelectedDeviceId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar micrófono" />
            </SelectTrigger>
            <SelectContent>
              {audioDevices.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Micrófono ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botón de iniciar/detener */}
          <Button
            onClick={handleStartStop}
            className="w-full"
            variant={isRecording ? "destructive" : "default"}
          >
            {isRecording ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Detener Transcripción
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Iniciar Transcripción
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Visualizadores (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {micStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio del Micrófono (Psicólogo)</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualizer stream={micStream} />
            </CardContent>
          </Card>
        )}
        {systemStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio del Sistema (Paciente)</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualizer stream={systemStream} />
            </CardContent>
          </Card>
        )}
        {combinedStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio Combinado</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualizer stream={combinedStream} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transcripciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripción</CardTitle>
        </CardHeader>
        <CardContent className="h-96 overflow-y-auto">
          <TranscriptionPanel transcriptions={transcriptions} />
        </CardContent>
      </Card>
    </div>
  );
}