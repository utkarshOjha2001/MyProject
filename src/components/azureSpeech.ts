import axios from 'axios';
import {Buffer} from 'buffer';
import RNFS from 'react-native-fs';
import { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } from '@env';

const azureEndpoint = `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

export const transcribeAudio = async (audioFilePath: string) => {
    try {
      const audioData = await RNFS.readFile(audioFilePath, 'base64');
  
      const response = await axios.post(
        azureEndpoint,
        Buffer.from(audioData, 'base64'),
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'audio/wav',
            'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
            'Transfer-Encoding': 'chunked'
          }
        }
      );
  
      const { data } = response;
      console.log('Azure Response:', data);
  
      if (data.RecognitionStatus === 'Success') {
        
        return data.DisplayText || data.NBest?.[0]?.Display || '[No speech detected]';
      } else {
        return `[Recognition failed: ${data.RecognitionStatus}]`;
      }
    } catch (error:any) {
      console.error('Speech-to-Text Error:', error);
      return '[Error processing audio]';
    }
  };
