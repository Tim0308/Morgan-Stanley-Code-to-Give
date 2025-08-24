import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { explainScreenshot } from '../lib/api';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ExplainButtonProps {
  screenRef: React.RefObject<View | null>;
}

const DraggableExplainButton: React.FC<ExplainButtonProps> = ({ screenRef }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Button position - start at bottom right
  const translateX = useSharedValue(screenWidth - 80);
  const translateY = useSharedValue(screenHeight - 150);

  const handleExplain = async () => {
    console.log('🔍 ExplainButton: Starting screenshot capture process...');
    
    // Detailed logging for debugging
    console.log('📱 ExplainButton: Checking screenRef...');
    console.log('📱 ExplainButton: screenRef exists:', !!screenRef);
    console.log('📱 ExplainButton: screenRef.current exists:', !!screenRef?.current);
    
    if (!screenRef) {
      console.error('❌ ExplainButton: screenRef is null or undefined');
      Alert.alert('Error', 'Screen reference is missing');
      return;
    }

    if (!screenRef.current) {
      console.error('❌ ExplainButton: screenRef.current is null or undefined');
      Alert.alert('Error', 'Unable to capture screen - view not found');
      return;
    }

    setIsLoading(true);
    console.log('⏳ ExplainButton: Setting loading to true');

    try {
      console.log('📸 ExplainButton: Starting screen capture...');
      
      // Capture screenshot using the provided screenRef
      const uri = await captureRef(screenRef, {
        format: 'png',
        quality: 0.8,
        result: 'base64'
      });

      if (!uri) {
        console.error('❌ ExplainButton: Screenshot capture returned empty result');
        Alert.alert('Screenshot Error', 'Failed to capture screenshot');
        return;
      }

      console.log('✅ ExplainButton: Screenshot captured successfully');
      console.log('📊 ExplainButton: Screenshot data length:', uri.length);

      console.log('🚀 ExplainButton: Sending to AI service...');

      // Send to backend for AI analysis
      const explanation = await explainScreenshot(uri);
      
      console.log('✅ ExplainButton: AI explanation received');
      console.log('📝 ExplainButton: Explanation length:', explanation?.length || 0);
      
      // Show explanation in alert (you can customize this to show in a modal)
      Alert.alert('AI Explanation', explanation || 'No explanation received', [{ text: 'OK' }]);
    } catch (error: any) {
      console.error('❌ ExplainButton: Full error details:', {
        error,
        type: typeof error,
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        isString: typeof error === 'string' ? error : 'not a string'
      });

      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error?.message?.includes('reactTag')) {
        errorMessage = 'Unable to capture screen. Please try again.';
      } else if (error?.message?.includes('network') || error?.message?.includes('API')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      console.log('🏁 ExplainButton: Process completed');
    }
  };

  const panGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      // Store initial position when drag starts
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      // Update position during drag
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      // Snap to edges when drag ends
      const buttonSize = 56;
      const margin = 20;

      // Constrain to screen bounds
      let finalX = translateX.value;
      let finalY = translateY.value;

      // Snap to left or right edge (whichever is closer)
      if (translateX.value < screenWidth / 2) {
        finalX = margin; // Snap to left
      } else {
        finalX = screenWidth - buttonSize - margin; // Snap to right
      }

      // Keep within vertical bounds
      if (finalY < margin) {
        finalY = margin;
      } else if (finalY > screenHeight - buttonSize - margin - 100) { // Account for bottom nav
        finalY = screenHeight - buttonSize - margin - 100;
      }

      // Animate to final position
      translateX.value = withSpring(finalX);
      translateY.value = withSpring(finalY);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View
          style={styles.button}
          onTouchEnd={() => {
            runOnJS(handleExplain)();
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>AI</Text>
          )}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    elevation: 5,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DraggableExplainButton;
