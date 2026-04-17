import { useState, useEffect, useRef } from 'react';

/**
 * Hook to analyze audio from the user's microphone in real-time.
 * Returns a value between 0 and 1 representing the current volume.
 */
export function useAudioAnalyzer(isActive: boolean) {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    async function setupAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Normalize to 0-1 range (max roughly 128)
          const normalizedVolume = Math.min(average / 64, 1);
          setVolume(normalizedVolume);

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.error('Error accessing microphone for visualizer:', err);
      }
    }

    setupAudio();

    return () => cleanup();
  }, [isActive]);

  const cleanup = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setVolume(0);
  };

  return volume;
}
