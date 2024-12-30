// src/pages/TranscriptionPage.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Mic, StopCircle } from "lucide-react";

import useAuth from "../hooks/useAuth"; // si lo necesitas, si no, quítalo
import useRealtimeCapture from "../hooks/useAudioCapture";
import AudioVisualizer from "../components/AudioVisualizer";
import TranscriptionPanel from "../components/TranscriptionPanel";

interface Transcription {
  speaker?: string;
  text: string;
  timestamp: number;
}

export default function TranscriptionPage() {
  const user = useAuth();  // Ajusta si no usas un hook de auth
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);

  const {
    startCapture,
    stopCapture,
    micStream,
    systemStream,
    combinedStream,
  } = useRealtimeCapture({
    setTranscriptions,
    selectedDeviceId,
  });

  // Al montar, enumeramos micrófonos
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

  const handleStartStop = async () => {
    if (isRecording) {
      stopCapture();
    } else {
      await startCapture();
    }
    setIsRecording(!isRecording);
  };

  if (user === null) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="flex flex-col w-screen min-h-screen p-4 space-y-4 bg-background text-foreground">
      <h1 className="text-3xl font-bold text-center mb-8">
        Transcripción Realtime (Mic + Sistema) 
      </h1>

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

      {/* Visualizadores de audio (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {micStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio Micrófono</CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualizer stream={micStream} />
            </CardContent>
          </Card>
        )}
        {systemStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio Sistema</CardTitle>
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

      {/* Panel de Transcripciones */}
      <Card>
        <CardHeader>
          <CardTitle>Transcripciones</CardTitle>
        </CardHeader>
        <CardContent className="h-96 overflow-y-auto">
          <TranscriptionPanel transcriptions={transcriptions} />
        </CardContent>
      </Card>
    </div>
  );
}