import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'react-native';

interface PasswordScreenProps {
  onNext: (password: string) => void;
  onBack?: () => void;
}

export default function PasswordScreen({ onNext, onBack }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {
    if (password.trim().length >= 6) {
      onNext(password.trim());
    }
  };

  const isValid = password.trim().length >= 6;

  return (
    <ImageBackground
            source={require('..\\assets\\backdrop.jpg')}
            style={styles.container}
            resizeMode="cover"
          >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
                   >
             <View style={styles.card}>
               {onBack && (
                 <TouchableOpacity style={styles.backButton} onPress={onBack}>
                   <Ionicons name="arrow-back" size={24} color="#006e34" />
                 </TouchableOpacity>
               )}
               <Text style={styles.title}>Now it's time for creating a password</Text>
          <Text style={styles.subtitle}>
            Just like any app, we want to make sure only you can access to your account
          </Text>
          
          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed" size={20} color="#006e34" style={styles.lockIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#006e34"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>
          
          {password.length > 0 && password.length < 6 && (
            <Text style={styles.errorText}>
              Password must be at least 6 characters
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, isValid && styles.activeButton]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={[styles.nextButtonText, !isValid && styles.disabledButtonText]}>
              Next
            </Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#F4F4F9',
    borderRadius: 28,
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    shadowColor: '#006e34',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006e34',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    opacity: 0.8,
  },
  passwordContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  lockIcon: {
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  nextButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#A6B84E',
  },
  activeButton: {
    backgroundColor: '#C83E0A',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4F9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#006e34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
}); 