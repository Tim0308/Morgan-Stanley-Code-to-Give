// import React, { useRef, useState } from 'react';
// import { View, Text, StyleSheet, Alert, ActivityIndicator, Dimensions } from 'react-native';
// import { captureRef } from 'react-native-view-shot';
// import { explainScreenshot } from '../lib/api';
// import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
// import Animated, {
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   useSharedValue,
//   runOnJS,
//   withSpring,
// } from 'react-native-reanimated';
//   withSpring
// } from 'react-native-reanimated';
// import { PanGestureHandler, State } from 'react-native-gesture-handler';

// interface ExplainButtonProps {
//   screenRef: React.RefObject<View | null>;
// }

// const ExplainButton: React.FC<ExplainButtonProps> = ({ screenRef }) => {
//   const [isLoading, setIsLoading] = useState(false);

//   const handleExplain = async () => {
//     console.log('🔍 ExplainButton: Starting screenshot capture process...');

//     // Detailed logging for debugging
//     console.log('📱 ExplainButton: Checking screenRef...');
//     console.log('📱 ExplainButton: screenRef exists:', !!screenRef);
//     console.log('📱 ExplainButton: screenRef.current exists:', !!screenRef?.current);

//     if (!screenRef) {
//       console.error('❌ ExplainButton: screenRef is null or undefined');
//       Alert.alert('Error', 'Screen reference is missing');
//       return;
//     }

//     if (!screenRef.current) {
//       console.error('❌ ExplainButton: screenRef.current is null or undefined');
//       Alert.alert('Error', 'Unable to capture screen - view not found');
//       return;
//     }

//     console.log('✅ ExplainButton: screenRef validation passed');
//     setIsLoading(true);

//     try {
//       console.log('📸 ExplainButton: Attempting to capture screenshot...');
//       console.log('📸 ExplainButton: Using captureRef with options:', {
//         format: 'jpg',
//         quality: 0.8,
//         result: 'base64',
//       });

//       // Add a small delay to ensure the view is fully rendered
//       await new Promise(resolve => setTimeout(resolve, 100));

//       // Capture screenshot as base64
//       const uri = await captureRef(screenRef, {
//         format: 'jpg',
//         quality: 0.8,
//         result: 'base64',
//       });

//       console.log('✅ ExplainButton: Screenshot captured successfully');
//       console.log('📏 ExplainButton: Screenshot data length:', uri?.length || 0);

//       if (!uri || uri.length === 0) {
//         throw new Error('Screenshot capture returned empty data');
//       }

//       console.log('🚀 ExplainButton: Sending to AI service...');

//       // Send to backend for AI analysis
//       const explanation = await explainScreenshot(uri);

//       console.log('✅ ExplainButton: AI explanation received');
//       console.log('📝 ExplainButton: Explanation length:', explanation?.length || 0);

//       // Show explanation in alert (you can customize this to show in a modal)
//       Alert.alert('AI Explanation', explanation || 'No explanation received', [{ text: 'OK' }]);
//     } catch (error: any) {
//       console.error('❌ ExplainButton: Full error details:', {
//         error,
//         type: typeof error,
//         name: error?.name,
//         message: error?.message,
//         stack: error?.stack,
//         isString: typeof error === 'string' ? error : 'not a string'
//       });

//       let errorMessage = 'An unexpected error occurred. Please try again.';

//       if (error?.message?.includes('reactTag')) {
//         errorMessage = 'Unable to capture screen. Please try again.';
//       } else if (error?.message?.includes('network') || error?.message?.includes('API')) {
//         errorMessage = 'Network error. Please check your connection and try again.';
//       }

//       Alert.alert('Error', errorMessage);
//     } finally {
//       setIsLoading(false);
//       console.log('🏁 ExplainButton: Process completed');
//     }
//   };

//   return (
//     <TouchableOpacity
//       style={styles.explainButton}
//       onPress={handleExplain}
//       disabled={isLoading}
//     >
//       <View style={styles.buttonContent}>
//         {isLoading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <>
//             <Text style={styles.buttonIcon}>❓</Text>
//             <Text style={styles.buttonText}>Explain</Text>
//           </>
//         )}
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   explainButton: {
//     position: 'absolute',
//     bottom: 100,
//     right: 20,
//     backgroundColor: '#8b5cf6',
//     borderRadius: 25,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     zIndex: 1000,
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonIcon: {
//     fontSize: 16,
//     marginRight: 6,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });

// export default ExplainButton;
