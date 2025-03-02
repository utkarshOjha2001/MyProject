import AudioRecord from 'react-native-audio-record';
import RNFS from 'react-native-fs';

const options = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  wavFile: 'test_audio.wav',
};

let silenceTimeout: NodeJS.Timeout | null = null;

export const startRecording = (onSilenceDetected: () => void) => {
  AudioRecord.init(options);
  AudioRecord.start();

  AudioRecord.on('data', (data: any) => {
    const level = Math.max(...new Int16Array(data));
    console.log('Audio level:', level); // Debugging

    if (level < 500) { // Silence threshold
      if (!silenceTimeout) {
        silenceTimeout = setTimeout(() => {
          silenceTimeout = null;
          console.log('Silence detected, stopping recording...');
          onSilenceDetected();
        }, 3000); // 3 seconds of silence
      }
    } else {
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        silenceTimeout = null;
      }
    }
  });
};

export const stopRecording = async (): Promise<string> => {
  const audioFile = await AudioRecord.stop();
  const filePath = `${RNFS.DocumentDirectoryPath}/${options.wavFile}`;

  if (!(await RNFS.exists(filePath))) {
    console.error('Recording failed: File does not exist');
    return '';
  }

  return filePath;
};
