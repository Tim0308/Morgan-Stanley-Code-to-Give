import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#006e34',
  secondary: '#A6B84E',
  accent: '#C83E0A',
  light: '#F4F4F9',
  textDark: '#222',
  textLight: '#fff',
  border: '#e5e7eb',
  inputBg: '#F4F4F9',
};

interface NameInputScreenProps {
  onNext: (name: string, relationship: string) => void;
  onBack?: () => void;
}

export default function NameInputScreen({ onNext, onBack }: NameInputScreenProps) {
  const [step, setStep] = useState(1); // 1: name input, 2: relationship selection
  const [name, setName] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('');

  const relationships = [
    'Father',
    'Mother',
    'Grandmother',
    'Grandfather',
    'Aunt',
    'Uncle',
    'Sister (above 18)',
    'Brother (above 18)',
    'Caregiver',
    'Guardian',
    'Other',
  ];

  const handleNameNext = () => {
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleRelationshipNext = () => {
    if (selectedRelationship) {
      onNext(name.trim(), selectedRelationship);
    }
  };

  const isNameValid = name.trim().length > 0;
  const isRelationshipValid = selectedRelationship.length > 0;

  if (step === 1) {
    // Name Input Screen
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
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                <Text style={styles.title}>Input your name</Text>
                <Text style={styles.subtitle}>
                  You can write your real name, or your kids' name like "Kelly's mom"
                </Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Name"
                  placeholderTextColor={COLORS.primary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    isNameValid ? styles.activeButton : styles.disabledButton,
                  ]}
                  onPress={handleNameNext}
                  disabled={!isNameValid}
                >
                  <Text
                    style={[
                      styles.nextButtonText,
                      !isNameValid && styles.disabledButtonText,
                    ]}
                  >
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

  // Relationship Selection Screen
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
              <Text style={styles.title}>
                Then type in the relationship you have with your kids
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                activeOpacity={0.85}
              >
                <Text style={[styles.dropdownText, !selectedRelationship && styles.placeholderText]}>
                  {selectedRelationship || 'Select relationship'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <ScrollView style={styles.relationshipList} showsVerticalScrollIndicator={false}>
                {relationships.map((relationship) => (
                  <TouchableOpacity
                    key={relationship}
                    style={[
                      styles.relationshipItem,
                      selectedRelationship === relationship && styles.selectedRelationship,
                    ]}
                    onPress={() => setSelectedRelationship(relationship)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.relationshipText,
                        selectedRelationship === relationship && styles.selectedRelationshipText,
                      ]}
                    >
                      {relationship}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  isRelationshipValid ? styles.activeButton : styles.disabledButton,
                ]}
                onPress={handleRelationshipNext}
                disabled={!isRelationshipValid}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    !isRelationshipValid && styles.disabledButtonText,
                  ]}
                >
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
  card: {
    backgroundColor: COLORS.light,
    borderRadius: 28,
    padding: 32,
    paddingTop: 60,
    alignItems: 'center',
    shadowColor: COLORS.primary,
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
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    opacity: 0.8,
  },
  nameInput: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 17,
    backgroundColor: COLORS.inputBg,
    color: COLORS.primary,
    marginBottom: 30,
  },
  dropdown: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  placeholderText: {
    color: '#999',
  },
  nextButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  activeButton: {
    backgroundColor: COLORS.accent, // Orange when enabled
  },
  disabledButton: {
    backgroundColor: COLORS.secondary, // Light green when disabled
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  disabledButtonText: {
    opacity: 0.7,
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
  relationshipList: {
    maxHeight: 250,
    marginBottom: 20,
    width: '100%',
  },
  relationshipItem: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
  },
  selectedRelationship: {
    backgroundColor: COLORS.secondary,
  },
  relationshipText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
  },
  selectedRelationshipText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});