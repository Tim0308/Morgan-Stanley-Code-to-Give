import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeScreenProps {
  onContinue: () => void;
  onBackToLogin?: () => void;
}

export default function WelcomeScreen({ onContinue, onBackToLogin }: WelcomeScreenProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onContinue} activeOpacity={1}>
      <LinearGradient
        colors={['#8b5cf6', '#3b82f6']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>👋</Text>
          </View>
          
          <Text style={styles.title}>Hi, welcome to REACH app</Text>
          <Text style={styles.subtitle}>We are so excited to have you here</Text>
          
          <View style={styles.footer}>
            <Text style={styles.continueText}>Press anywhere to continue</Text>
            {onBackToLogin && (
              <TouchableOpacity style={styles.backToLoginButton} onPress={onBackToLogin}>
                <Text style={styles.backToLoginText}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    marginBottom: 60,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  continueText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  backToLoginButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
}); 