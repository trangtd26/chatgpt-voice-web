import React, { useState, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import styles from './MicButton.module.scss';

interface Props {
  onResult: (text: string) => void;
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const bufferLen = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLen);
  const view = new DataView(arrayBuffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function MicButton({ onResult }: Props) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      mr.onstart = () => setRecording(true);

      mr.onstop = async () => {
        setRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioCtx();

          const audioBuffer: AudioBuffer = await new Promise((resolve, reject) => {
            audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
          });

          const wav = audioBufferToWavBlob(audioBuffer);

          const fd = new FormData();
          fd.append('file', wav, 'record.wav');
          const res = await fetch('http://localhost:5001/speech', { method: 'POST', body: fd });
          if (res.ok) {
            const data = await res.json();
            if (data?.text) onResult(data.text);
            else onResult('Thu âm xong nhưng server không trả về transcript');
          } else {
            console.error('Upload failed', res.statusText);
            onResult('Thu âm xong nhưng upload thất bại');
          }

          if (audioCtx && typeof audioCtx.close === 'function') audioCtx.close();
        } catch (err) {
          console.error('Convert/upload failed', err);
          onResult('Thu âm xong nhưng chuyển đổi/upload lỗi');
        }

        // cleanup tracks
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        mediaRecorderRef.current = null;
        chunksRef.current = [];
      };

      mr.onerror = (e) => {
        console.error('MediaRecorder error', e);
        setRecording(false);
      };

      mr.start();
    } catch (err: any) {
      console.error('getUserMedia failed', err);
      alert('Không thể truy cập microphone: ' + (err?.message || err));
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const onClick = () => {
    if (recording) stop();
    else start();
  };

  return (
    <div className={styles.micWrap}>
      <IconButton
        aria-label={recording ? 'Dừng thu âm' : 'Bắt đầu thu âm'}
        onClick={onClick}
        className={`${recording ? styles.recording : styles.idle} ${recording ? styles.pulse : ''}`}
        size="medium"
      >
        {recording ? <StopIcon /> : <MicIcon />}
      </IconButton>
    </div>
  );
}
