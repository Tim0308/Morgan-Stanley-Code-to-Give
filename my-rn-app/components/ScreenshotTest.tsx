import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const ScreenshotTest: React.FC = () => {
  const testRef = useRef<View>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testScreenshot = async () => {
    console.log('🧪 ScreenshotTest: Starting test...');
    
    if (!testRef.current) {
      console.error('❌ ScreenshotTest: testRef.current is null');
      Alert.alert('Error', 'Test view reference is null');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📸 ScreenshotTest: Capturing screenshot...');
      
      const uri = await captureRef(testRef, {
        format: 'png',
        quality: 1.0,
        result: 'base64',
      });

      console.log('✅ ScreenshotTest: Screenshot captured!');
      console.log('📏 ScreenshotTest: Data length:', uri.length);
      
      Alert.alert('Success!', `Screenshot captured! Data length: ${uri.length} characters`);
    } catch (error) {
      console.error('❌ ScreenshotTest: Error:', error);
      Alert.alert('Error', `Screenshot failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View ref={testRef} style={styles.testArea} collapsable={false}>
        <Text style={styles.title}>Screenshot Test Area</Text>
        <Text style={styles.subtitle}>This should be captured</Text>
        <View style={styles.colorBox} />
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testScreenshot}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Screenshot'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testArea: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  colorBox: {
    width: 50,
    height: 50,
    backgroundColor: '#8b5cf6',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScreenshotTest;
