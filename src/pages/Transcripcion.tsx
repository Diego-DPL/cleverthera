import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Mic, StopCircle } from "lucide-react";

import useAudioCapture from "../hooks/useAudioCapture";
import useAuth from "../hooks/useAuth";  // Ajusta si usas tu propia auth
import AudioVisualizer from "../components/AudioVisualizer"; // Opcional
import TranscriptionPanel from "../components/TranscriptionPanel";

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}

export default function TranscriptionPage() {
  const user = useAuth();  // Ajusta o elimina si no usas este hook
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  const {
    startCapture,
    stopCapture,
    micStream,
    combinedStream
  } = useAudioCapture({
    setTranscriptions,
    selectedDeviceId,
  });

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setAudioDevices(devices.filter((device) => device.kind === "audioinput"));
      })
      .catch((err) => console.error("Error al enumerar dispositivos:", err));
  }, []);

  const handleStartStop = () => {
    if (isRecording) {
      stopCapture();
    } else {
      startCapture();
    }
    setIsRecording(!isRecording);
  };

  if (user === null) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col w-screen min-h-screen p-4 space-y-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-center mb-8">Transcripción de Pacientes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(value) => setSelectedDeviceId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar dispositivo de entrada" />
            </SelectTrigger>
            <SelectContent>
            {audioDevices
              .filter((device) => device.deviceId && device.deviceId.trim() !== "")
              .map((device, index) => (
                <SelectItem key={index} value={device.deviceId}>
                  {device.label || `Micrófono ${device.deviceId.slice(0, 5)}`}
                </SelectItem>
              ))
            }
            </SelectContent>
          </Select>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {micStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio del Micrófono</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualizer stream={micStream} />
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