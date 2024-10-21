import React, { useEffect, useState } from 'react';

interface AudioDeviceSelectorProps {
  selectedDeviceId: string | null;
  setSelectedDeviceId: (deviceId: string) => void;
}

const AudioDeviceSelector: React.FC<AudioDeviceSelectorProps> = ({
  selectedDeviceId,
  setSelectedDeviceId,
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = deviceInfos.filter(
        (device) => device.kind === 'audioinput'
      );
      setDevices(audioInputs);
    };
    getDevices();
  }, []);

  return (
    <div className='flex justify-center items-center mb-4'>
      <label className='text-gray-800' htmlFor="audio-input">Selecciona un micrófono: </label>
      <select
        id="audio-input"
        value={selectedDeviceId || ''}
        onChange={(e) => setSelectedDeviceId(e.target.value)}
        className='block w-[50%] p-2 border border-gray-300 rounded-md'
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Dispositivo ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AudioDeviceSelector;
