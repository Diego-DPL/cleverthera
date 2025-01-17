import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Mic, StopCircle } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useRealtimeCapture from "../hooks/useAudioCapture";
import AudioVisualizer from "../components/AudioVisualizer";

export default function TranscriptionPage() {
  const user = useAuth();
  const [transcription, setTranscription] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  const {
    startCapture,
    stopCapture,
    micStream,
    combinedStream,
  } = useRealtimeCapture({
    setTranscriptions: setTranscription, // Cambiado para manejar el texto final
    selectedDeviceId,
  });

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const audioInputs = devices.filter(
          (d) => d.kind === "audioinput" && d.deviceId.trim() !== ""
        );
        setAudioDevices(audioInputs);
      })
      .catch((err) => console.error("Error enumerando dispositivos:", err));
  }, []);

  const handleStartStop = () => {
    if (isRecording) {
      stopCapture();
      setIsRecording(false);
    } else {
      startCapture();
      setTranscription(null); // Resetea la transcripción al iniciar
      setIsRecording(true);
    }
  };

  if (user === null) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col w-screen min-h-screen p-4 space-y-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-center mb-8">Transcripción de Reunión</h1>

      {/* Configuración de Audio */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <Button
            onClick={handleStartStop}
            className="w-full"
            variant={isRecording ? "destructive" : "default"}
          >
            {isRecording ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Detener
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Iniciar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Visualizador de Audio */}
      {isRecording && combinedStream && (
        <Card>
          <CardHeader>
            <CardTitle>Grabando...</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioVisualizer stream={combinedStream} />
          </CardContent>
        </Card>
      )}

      {/* Panel de Transcripción */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripción</CardTitle>
        </CardHeader>
        <CardContent className="h-96 overflow-y-auto">
          {transcription ? (
            <p>{transcription}</p>
          ) : (
            <p>No hay transcripción disponible.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
