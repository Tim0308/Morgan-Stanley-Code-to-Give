import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NameInputScreenProps {
  onNext: (name: string, relationship: string) => void;
  onBack?: () => void;
}

export default function NameInputScreen({ onNext, onBack }: NameInputScreenProps) {
  const [step, setStep] = useState(1); // 1: name input, 2: relationship selection
  const [name, setName] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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
    'Other'
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
                <Text style={styles.title}>Input your name</Text>
                <Text style={styles.subtitle}>
                  You can write your real name, or your kids' name like "Kelly's mom"
                </Text>
            
            <TextInput
              style={styles.nameInput}
              placeholder="Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
            
            <TouchableOpacity
              style={[styles.nextButton, isNameValid && styles.activeButton]}
              onPress={handleNameNext}
              disabled={!isNameValid}
            >
              <Text style={[styles.nextButtonText, !isNameValid && styles.disabledButtonText]}>
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

    // Relationship Selection Screen
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
            <Text style={styles.title}>
              Then type in the relationship you have with your kids
            </Text>
            
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown(true)}
            >
              <Text style={[styles.dropdownText, !selectedRelationship && styles.placeholderText]}>
                {selectedRelationship || 'Select relationship'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            <ScrollView style={styles.relationshipList} showsVerticalScrollIndicator={false}>
              {relationships.map((relationship) => (
                <TouchableOpacity
                  key={relationship}
                  style={[
                    styles.relationshipItem,
                    selectedRelationship === relationship && styles.selectedRelationship
                  ]}
                  onPress={() => setSelectedRelationship(relationship)}
                >
                  <Text style={[
                    styles.relationshipText,
                    selectedRelationship === relationship && styles.selectedRelationshipText
                  ]}>
                    {relationship}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.nextButton, isRelationshipValid && styles.activeButton]}
              onPress={handleRelationshipNext}
              disabled={!isRelationshipValid}
            >
              <Text style={[styles.nextButtonText, !isRelationshipValid && styles.disabledButtonText]}>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  nameInput: {
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
  dropdown: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
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
  relationshipList: {
    maxHeight: 250,
    marginBottom: 20,
  },
  relationshipItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  selectedRelationship: {
    backgroundColor: '#8b5cf6',
  },
  relationshipText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedRelationshipText: {
    color: 'white',
    fontWeight: '600',
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
}); 