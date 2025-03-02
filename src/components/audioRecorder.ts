import AudioRecord from 'react-native-audio-record';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';


const options = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16, 
    wavFile: 'test_audio.wav'
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
  
    return filePath;
  };
