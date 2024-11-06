import React, { useState } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Mic, StopCircle } from 'lucide-react'
import useAudioCapture from '../hooks/useAudioCapture'
import useAuth from '../hooks/useAuth'
import AudioVisualizer from '../components/AudioVisualizer';

interface Transcription {
  speaker?: string
  text: string
  timestamp: number
}

export default function TranscripcionPage() {
  const user = useAuth()
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])

  const { startCapture, stopCapture, micStream, systemStream, combinedStream } = useAudioCapture({
    setTranscriptions,
    selectedDeviceId,
  })

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      setAudioDevices(devices.filter(device => device.kind === 'audioinput'))
    })
  }, [])

  const handleStartStop = () => {
    if (isRecording) {
      stopCapture()
    } else {
      startCapture()
    }
    setIsRecording(!isRecording)
  }

  if (user === null) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  return (
    <div className="flex flex-col w-screen min-h-screen bg-background text-foreground">
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
        {systemStream && (
          <Card>
            <CardHeader>
              <CardTitle>Audio del Sistema</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Transcripción</CardTitle>
        </CardHeader>
        <CardContent className="h-96 overflow-y-auto">
          {transcriptions.map((transcription, index) => (
            <div key={index} className="mb-2">
              <strong>{transcription.speaker}:</strong> {transcription.text}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}