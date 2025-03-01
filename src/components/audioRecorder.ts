import AudioRecord from 'react-native-audio-record';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';


const options = {
    sampleRate: 16000, // 16kHz
    channels: 1, // Mono
    bitsPerSample: 16, // PCM 16-bit
    wavFile: 'test_audio.wav' // File name
  };
const audioRecorderPlayer = new AudioRecorderPlayer();
const audioPath = `${RNFS.DocumentDirectoryPath}/speech.wav`;

export const startRecording = () => {
    AudioRecord.init(options);
    AudioRecord.start();
  };
  export const stopRecording = async (): Promise<string> => {
    const audioFile = await AudioRecord.stop();
    const filePath = `${RNFS.DocumentDirectoryPath}/${options.wavFile}`;
  
    if (!(await RNFS.exists(filePath))) {
      console.error('Recording failed: File does not exist');
      return '';
    }
  
    return filePath; // Return file path to send to Azure
  };
