import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';


const { width, height } = Dimensions.get('window');

interface VocabVentureGameProps {
  onClose: () => void;
  onGameComplete?: (result: any) => void;
}

export default function VocabVentureGame({ onClose, onGameComplete }: VocabVentureGameProps) {
  const [gameState, setGameState] = useState<'welcome' | 'camera' | 'result'>('welcome');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;
  
  const wordOfTheDay = 'DOG';
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Animate the word
  React.useEffect(() => {
    const bounce = () => {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => bounce());
    };
    bounce();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setGameState('camera');
    } else {
      Alert.alert('Permission needed', 'Camera permission is required to play this game.');
    }
  };

  const takePicture = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.assets && result.assets[0]) {
        await processImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (result.assets && result.assets[0]) {
        await processImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (imageAsset: any) => {
    try {
      setLoading(true);
      setAttempts(prev => prev + 1);

      // Get auth token from Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.access_token) {
        throw new Error('Authentication required');
      }
      const token = session.access_token;

      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'camera_capture.jpg'
      } as any);
      formData.append('word_of_the_day', wordOfTheDay);

      // Call your API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/camera/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const result = await response.json();
      console.log('🎮 VocabVenture AI Response:', result);
      setGameResult(result);
      setGameState('result');

      if (result.is_correct && onGameComplete) {
        onGameComplete(result);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const tryAgain = () => {
    if (attempts < maxAttempts) {
      setGameState('camera');
    } else {
      Alert.alert('Game Over', 'You have reached the maximum number of attempts.');
      onClose();
    }
  };

  const continueGame = () => {
    onClose();
  };

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>Welcome to VocabVenture!</Text>
        <Text style={styles.welcomeSubtitle}>Today's word is:</Text>
        
        <Animated.View
          style={[
            styles.wordContainer,
            {
              transform: [
                {
                  translateY: bounceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.wordOfDay}>{wordOfTheDay}</Text>
        </Animated.View>

        <TouchableOpacity style={styles.cameraButton} onPress={requestCameraPermission}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.cameraButtonText}>Open Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCameraScreen = () => (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Text style={styles.cameraTitle}>📸 Take a Picture</Text>
        <Text style={styles.instruction}>
          Look around you and find a{' '}
          <Text style={styles.wordHighlight}>{wordOfTheDay}</Text> in your surroundings!
        </Text>

        <View style={styles.cameraPreview}>
          <View style={styles.cameraPlaceholder}>
            <Ionicons name="camera" size={80} color="#666" />
            <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
            <Text style={styles.cameraPlaceholderSubtext}>
              Tap the buttons below to take a picture or pick from gallery
            </Text>
          </View>
        </View>

        <View style={styles.cameraOverlay}>
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={takePicture}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="camera" size={32} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
          <Ionicons name="images" size={20} color="white" />
          <Text style={styles.pickImageText}>Pick from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => setGameState('welcome')}>
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResultScreen = () => (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <View style={styles.resultIcon}>
          <Ionicons
            name={gameResult?.is_correct ? 'checkmark-circle' : 'close-circle'}
            size={80}
            color={gameResult?.is_correct ? '#4CAF50' : '#f44336'}
          />
        </View>

        <Text style={styles.resultTitle}>
          {gameResult?.is_correct ? 'Great Job!' : 'Try Again'}
        </Text>

        <Text style={styles.feedback}>{gameResult?.feedback}</Text>

        <View style={styles.resultButtons}>
          {!gameResult?.is_correct && attempts < maxAttempts && (
            <TouchableOpacity style={styles.tryAgainButton} onPress={tryAgain}>
              <Text style={styles.tryAgainText}>Try Again</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.continueButton} onPress={continueGame}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      {gameState === 'welcome' && renderWelcomeScreen()}
      {gameState === 'camera' && renderCameraScreen()}
      {gameState === 'result' && renderResultScreen()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  wordContainer: {
    marginVertical: 30,
  },
  wordOfDay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffd700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  cameraButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    marginTop: 30,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    padding: 20,
    marginTop: 50,
    marginBottom: 20,
  },
  cameraTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  wordHighlight: {
    fontWeight: 'bold',
    color: '#ffd700',
    fontSize: 20,
  },
  cameraPreview: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: {
    color: '#666',
    fontSize: 18,
  },
  cameraPlaceholderSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  pickImageButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  pickImageText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  resultIcon: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  feedback: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  tryAgainButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  tryAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
