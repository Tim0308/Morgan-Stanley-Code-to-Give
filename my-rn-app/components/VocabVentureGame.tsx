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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../contexts/TranslationContext';


const { width, height } = Dimensions.get('window');

interface VocabVentureGameProps {
  onClose: () => void;
  onGameComplete?: (result: any) => void;
}

export default function VocabVentureGame({ onClose, onGameComplete }: VocabVentureGameProps) {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<'welcome' | 'camera' | 'result' | 'completion' | 'wrongAnswer'>('welcome');
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
      // Automatically open camera when permission is granted
      await takePicture();
    } else {
      Alert.alert(t.permissionNeeded, t.cameraPermissionRequired);
    }
  };

  const takePicture = async () => {
    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
        base64: true,
      });

      if (result.assets && result.assets[0]) {
        await processImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(t.error, t.failedToTakePicture);
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
      Alert.alert(t.error, t.failedToPickImage);
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (imageAsset: any) => {
    try {
      setLoading(true);
      setAttempts(prev => prev + 1);

      // Store the image URI for display
      const resultWithImage = {
        imageUri: imageAsset.uri,
        is_correct: false,
        feedback: ''
      };
      setGameResult(resultWithImage);
      setGameState('camera');

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
      console.log('🎮 is_correct value:', result.is_correct);
      console.log('🎮 feedback:', result.feedback);
      
      // Update result with image URI and analysis
      const finalResult = {
        ...result,
        imageUri: imageAsset.uri
      };
      setGameResult(finalResult);

      // If correct, show completion screen, otherwise show wrong answer screen
      if (result.is_correct) {
        console.log('🎮 Setting gameState to completion');
        setGameState('completion');
        if (onGameComplete) {
          onGameComplete(finalResult);
        }
      } else {
        console.log('🎮 Setting gameState to wrongAnswer');
        setGameState('wrongAnswer');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert(t.error, t.failedToProcessImage);
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

  const completeChallenge = () => {
    // Close the game and return to GamesPage.tsx
    onClose();
  };

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      {/* Sky Background */}
      <View style={styles.skyBackground}>
        {/* Back button - top left of sky */}
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

                 {/* Tree */}
         <View style={styles.tree}>
           <View style={styles.treeTrunk} />
           <View style={styles.treeLeaves} />
         </View>

                   {/* Animated DOG word and instructions container */}
          <View style={styles.wordAndInstructionsContainer}>
            {/* Game instructions - above the word */}
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>Find a </Text>
            </View>

            {/* Animated DOG word - in the middle */}
            <Animated.View 
              style={[
                styles.animatedWord,
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
              <Text style={styles.animatedWordText}>{wordOfTheDay}</Text>
            </Animated.View>

            {/* Instructions text - below the word */}
            <Text style={styles.instructionText}>
              Look around you and take a picture of a {wordOfTheDay.toLowerCase()}
            </Text>
          </View>
        
      </View>

      {/* Grass Background */}
      <View style={styles.grassBackground}>
        {/* Animated dog mascot */}

        {/* Camera button - at bottom of grass */}
        <TouchableOpacity style={styles.cameraButton} onPress={requestCameraPermission}>
          <Ionicons name="camera" size={24} color="white" />
          <Text style={styles.cameraButtonText}>Take Picture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCameraScreen = () => (
    <View style={styles.container}>
      {/* Instructions at the very top */}
      <View style={styles.cameraInstructions}>
        <Text style={styles.cameraInstructionTitle}>Find a </Text>
        <Text style={styles.cameraInstructionText}>
          Look around you and take a picture of a {wordOfTheDay.toLowerCase()}
        </Text>
      </View>

      {/* Back button - top left corner */}
      <TouchableOpacity style={styles.cameraBackButton} onPress={() => setGameState('welcome')}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Image placeholder/frame slightly below center */}
      <View style={styles.imageFrame}>
        {gameResult?.imageUri ? (
          <Image source={{ uri: gameResult.imageUri }} style={styles.capturedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={60} color="#ccc" />
            <Text style={styles.imagePlaceholderText}>Take a picture here</Text>
          </View>
        )}
      </View>

      {/* Analysis feedback above take picture button */}
      {gameResult?.feedback && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisText}>{gameResult.feedback}</Text>
        </View>
      )}

      {/* Take picture button at the very bottom */}
      <TouchableOpacity 
        style={styles.cameraTakeButton} 
        onPress={takePicture}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.cameraTakeButtonText}>Take Picture</Text>
          </>
        )}
      </TouchableOpacity>
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
          {gameResult?.is_correct ? t.greatJob : t.tryAgain}
        </Text>

        <Text style={styles.feedback}>{gameResult?.feedback}</Text>

        <View style={styles.resultButtons}>
          {!gameResult?.is_correct && attempts < maxAttempts && (
            <TouchableOpacity style={styles.tryAgainButton} onPress={tryAgain}>
              <Text style={styles.tryAgainText}>{t.tryAgain}</Text>
            </TouchableOpacity>
          )}
          
          {gameResult?.is_correct && (
            <TouchableOpacity style={styles.completeButton} onPress={completeChallenge}>
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.continueButton} onPress={continueGame}>
            <Text style={styles.continueText}>{t.continue}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

     const renderWrongAnswerScreen = () => (
     <View style={styles.container}>
       <View style={styles.wrongAnswerContainer}>
         {/* Wrong Answer Icon */}
         <View style={styles.wrongAnswerIcon}>
           <Ionicons name="close-circle" size={80} color="#f44336" />
         </View>

         {/* Wrong Answer Title */}
         <Text style={styles.wrongAnswerTitle}>Oops! That's not a {wordOfTheDay}</Text>

         {/* Feedback Message */}
         <Text style={styles.wrongAnswerFeedback}>{gameResult?.feedback}</Text>

         {/* Wrong Image */}
         {gameResult?.imageUri && (
           <View style={styles.wrongImageContainer}>
             <Image source={{ uri: gameResult.imageUri }} style={styles.wrongImage} />
           </View>
         )}

         {/* Buttons */}
         <View style={styles.wrongAnswerButtons}>
           <TouchableOpacity style={styles.tryAgainButton} onPress={tryAgain}>
             <Text style={styles.tryAgainText}>Try Again</Text>
           </TouchableOpacity>
           
           <TouchableOpacity style={styles.backToGamesButton} onPress={onClose}>
             <Text style={styles.backToGamesText}>Back to Games</Text>
           </TouchableOpacity>
         </View>
       </View>
     </View>
   );

   const renderCompletionScreen = () => (
     <View style={styles.container}>
       <View style={styles.completionContainer}>
         {/* Confetti Animation */}
         <View style={styles.confettiContainer}>
           {[...Array(20)].map((_, index) => (
             <Animated.View
               key={index}
               style={[
                 styles.confetti,
                 {
                   backgroundColor: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD'][index % 5],
                   left: `${Math.random() * 100}%`,
                   transform: [
                     {
                       translateY: bounceAnim.interpolate({
                         inputRange: [0, 1],
                         outputRange: [0, 400],
                       }),
                     },
                   ],
                 },
               ]}
             />
           ))}
         </View>

         {/* Congratulations Message */}
         <View style={styles.congratsContainer}>
           <Ionicons name="trophy" size={80} color="#FFD700" />
           <Text style={styles.congratsTitle}>🎉 Congratulations! 🎉</Text>
           <Text style={styles.congratsText}>
             You have completed the weekly challenge!
           </Text>
         </View>

         {/* Completed Image */}
         {gameResult?.imageUri && (
           <View style={styles.completedImageContainer}>
             <Image source={{ uri: gameResult.imageUri }} style={styles.completedImage} />
           </View>
         )}

         {/* Complete Button */}
         <TouchableOpacity style={styles.completeButton} onPress={completeChallenge}>
           <Text style={styles.completeButtonText}>Complete</Text>
         </TouchableOpacity>
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
       {gameState === 'completion' && renderCompletionScreen()}
       {gameState === 'wrongAnswer' && renderWrongAnswerScreen()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Sky Background
  skyBackground: {
    flex: 2,
    backgroundColor: '#82C8E5',
    position: 'relative',
  },
  tree: {
    position: 'absolute',
    left: 20,
    bottom: 0,
  },
  treeTrunk: {
    width: 20,
    height: 60,
    backgroundColor: '#8B4513',
    borderRadius: 10,
  },
  treeLeaves: {
    width: 80,
    height: 80,
    backgroundColor: '#228B22',
    borderRadius: 40,
    position: 'absolute',
    bottom: 50,
    left: -30,
  },
  letterButtons: {
    position: 'absolute',
    top: 100,
    right: 50,
  },
  letterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  letterButton: {
    width: 30,
    height: 50,
    backgroundColor: '#FF69B4',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  letterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  // Grass Background
  grassBackground: {
    flex: 1,
    backgroundColor: '#90EE90',
    padding: 20,
    position: 'relative',
  },
  wordPuzzle: {
    marginTop: 50,
    marginBottom: 30,
  },
  wordPuzzleText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  wordLetter: {
    color: '#4B0082',
  },
  wordUnderscore: {
    color: '#4B0082',
  },

  wing: {
    width: 15,
    height: 10,
    backgroundColor: '#FFA500',
    borderRadius: 5,
  },
  imageHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 30,
  },
  imageHint: {
    alignItems: 'center',
  },
  imageFrame: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#87CEEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  instructions: {
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#4B0082',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
  },
  // Animated word styles
  wordAndInstructionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedWord: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animatedWordText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  
  cameraButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Camera screen styles
  cameraInstructions: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#87CEEB',
  },
  cameraInstructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  cameraInstructionText: {
    fontSize: 16,
    color: '#4B0082',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,  
  },
  cameraBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageFrame: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  analysisContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  analysisText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraTakeButton: {
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  cameraTakeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Result screen styles
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#87CEEB',
  },
  resultIcon: {
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  feedback: {
    fontSize: 18,
    color: '#4B0082',
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
  // Completion screen styles
  completeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  completeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#87CEEB',
    position: 'relative',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -10,
  },
  congratsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  congratsText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },
  completedImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 4,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
     completedImage: {
     width: '100%',
     height: '100%',
     resizeMode: 'cover',
   },
   // Wrong answer screen styles
   wrongAnswerContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     padding: 40,
     backgroundColor: '#87CEEB',
   },
   wrongAnswerIcon: {
     marginBottom: 20,
   },
   wrongAnswerTitle: {
     fontSize: 28,
     fontWeight: 'bold',
     color: '#f44336',
     textAlign: 'center',
     marginBottom: 20,
   },
   wrongAnswerFeedback: {
     fontSize: 18,
     color: '#4B0082',
     textAlign: 'center',
     lineHeight: 24,
     marginBottom: 30,
   },
   wrongImageContainer: {
     width: 200,
     height: 200,
     borderRadius: 15,
     overflow: 'hidden',
     marginBottom: 30,
     borderWidth: 4,
     borderColor: '#f44336',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.3,
     shadowRadius: 8,
     elevation: 8,
   },
   wrongImage: {
     width: '100%',
     height: '100%',
     resizeMode: 'cover',
   },
   wrongAnswerButtons: {
     flexDirection: 'row',
     gap: 15,
   },
   backToGamesButton: {
     backgroundColor: '#666',
     paddingHorizontal: 24,
     paddingVertical: 12,
     borderRadius: 25,
   },
   backToGamesText: {
     color: 'white',
     fontSize: 16,
     fontWeight: '600',
   },

 });
