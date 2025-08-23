import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ContactMethodScreenProps {
  onNext: (method: 'phone' | 'email', contact: string) => void;
  onBack?: () => void;
}

export default function ContactMethodScreen({ onNext, onBack }: ContactMethodScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<'phone' | 'email'>('phone');
  const [contact, setContact] = useState('');

  const handleNext = () => {
    if (contact.trim()) {
      onNext(selectedMethod, contact.trim());
    }
  };

  const isValid = contact.trim().length > 0;

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
               <Text style={styles.title}>Can we have a way to contact you?</Text>
          <Text style={styles.subtitle}>
            No one in this app will know about your personal information. They are all meant for creating an account only and identifying you for the teachers.
          </Text>
          
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'phone' && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod('phone')}
            >
              <Ionicons 
                name="call" 
                size={20} 
                color={selectedMethod === 'phone' ? 'white' : '#666'} 
              />
              <Text style={[
                styles.methodText,
                selectedMethod === 'phone' && styles.selectedMethodText
              ]}>
                Use Phone Number
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'email' && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod('email')}
            >
              <Ionicons 
                name="mail" 
                size={20} 
                color={selectedMethod === 'email' ? 'white' : '#666'} 
              />
              <Text style={[
                styles.methodText,
                selectedMethod === 'email' && styles.selectedMethodText
              ]}>
                Use Email
              </Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.contactInput}
            placeholder={selectedMethod === 'phone' ? 'Phone Number' : 'Email Address'}
            placeholderTextColor="#999"
            value={contact}
            onChangeText={setContact}
            keyboardType={selectedMethod === 'phone' ? 'phone-pad' : 'email-address'}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
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
  methodSelector: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  selectedMethod: {
    backgroundColor: '#1a1a2e',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedMethodText: {
    color: 'white',
  },
  contactInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 30,
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