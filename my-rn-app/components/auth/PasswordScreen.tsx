import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
    <LinearGradient
      colors={['#8b5cf6', '#3b82f6']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
                   <Ionicons name="arrow-back" size={24} color="#666" />
                 </TouchableOpacity>
               )}
               <Text style={styles.title}>Now it's time for creating a password</Text>
          <Text style={styles.subtitle}>
            Just like any app, we want to make sure only you can access to your account
          </Text>
          
          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed" size={20} color="#999" style={styles.lockIcon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
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
    </LinearGradient>
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
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
    height: 50,
    backgroundColor: '#6b7280',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#1a1a2e',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  disabledButtonText: {
    opacity: 0.6,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
}); 