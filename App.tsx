import React, { useState, useEffect } from 'react';
import { startRecording, stopRecording } from './src/components/audioRecorder';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { transcribeAudio } from './src/components/azureSpeech';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const App = (): React.JSX.Element => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);


  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'This app needs access to your microphone for speech recognition.',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            }
          );
          setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
        } catch (error) {
          console.error('Permission request failed:', error);
        }
      } else {
        setHasPermission(true);
      }
    };

    requestPermissions();
  }, []);

  const fetchAudioData = async (message: string) => {
    console.log(message)
    try {
      const response = await fetch(`http://192.168.1.102:8000/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to fetch audio');

      const audioBlob = await response.blob();
      const reader = new FileReader();

      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];

        if (!base64Audio) {
          console.error('Error converting blob to base64');
          return;
        }

        const filePath = `${RNFS.DocumentDirectoryPath}/response_audio.mp3`;
        await RNFS.writeFile(filePath, base64Audio, 'base64');
        const sound = new Sound(filePath, '', (error) => {
          if (error) {
            console.error('Error loading audio:', error);
            return;
          }
          sound.play((success) => {
            if (success) {
              console.log('Audio played successfully');
              startRecording(); // Restart recording after audio ends
            } else {
              console.error('Audio playback failed');
            }
          });
        });
      };
    } catch (error) {
      console.error(error);
    }
  };

  const handleMicPress = async () => {
    if (!hasPermission) {
      console.warn('Microphone permission not granted');
      return;
    }

    if (isRecording) {
      const filePath = await stopRecording();
      setIsRecording(false);
      const text = await transcribeAudio(filePath);
      setTranscription(text || 'Could not transcribe');
      await fetchAudioData(text);
    } else {
      setIsRecording(true);
      startRecording();
    }
  };

  return (
    <LinearGradient colors={['#1d1843', '#1a1836', '#2a2a2a']} style={styles.container}>
      <View style={styles.centerContainer}>
        <Text style={styles.text}>{transcription || 'Tap the mic and start speaking...'}</Text>
        <TouchableOpacity onPress={handleMicPress} style={styles.micButton}>
          <Text style={styles.micButton}>{isRecording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#fff', textAlign: 'center', paddingHorizontal: 20 },
  micButton: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 30,
    color: '#fff',
    backgroundColor: '#DB5079',
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  listening: { backgroundColor: '#28A745' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  micIcon: { fontSize: 30, color: '#fff' },
});

export default App;
