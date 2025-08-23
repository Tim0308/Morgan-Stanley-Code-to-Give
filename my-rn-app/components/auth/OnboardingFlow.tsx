import React, { useState } from 'react';
import { Alert } from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import NameInputScreen from './NameInputScreen';
import ContactMethodScreen from './ContactMethodScreen';
import PasswordScreen from './PasswordScreen';
import LoadingScreen from './LoadingScreen';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingData {
  name: string;
  relationship: string;
  contactMethod: 'phone' | 'email';
  contact: string;
  password: string;
}

interface OnboardingFlowProps {
  onBackToLogin?: () => void;
}

export default function OnboardingFlow({ onBackToLogin }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const { signUp } = useAuth();

  const handleWelcomeContinue = () => {
    setStep(1);
  };

  const handleNameNext = (name: string, relationship: string) => {
    setData(prev => ({ ...prev, name, relationship }));
    setStep(2);
  };

  const handleContactNext = (method: 'phone' | 'email', contact: string) => {
    setData(prev => ({ ...prev, contactMethod: method, contact }));
    setStep(3);
  };

  const handlePasswordNext = async (password: string) => {
    try {
      const finalData = { ...data, password };
      setData(finalData);
      setStep(4); // Show loading screen

      // Convert phone number to email format for Supabase Auth
      let authEmail = finalData.contact!;
      if (finalData.contactMethod === 'phone') {
        // Convert phone to email format: phone@reach.app
        const cleanPhone = finalData.contact!.replace(/\D/g, ''); // Remove non-digits
        authEmail = `${cleanPhone}@reach.app`;
      }

      // Create account with Supabase
      await signUp(
        authEmail,
        password,
        {
          name: finalData.name,
          relationship: finalData.relationship,
          contactMethod: finalData.contactMethod,
          originalContact: finalData.contact, // Store original phone/email
        }
      );

    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Failed to create account. Please try again.',
        [{ text: 'OK', onPress: () => setStep(3) }] // Go back to password screen
      );
    }
  };

  const handleLoadingComplete = () => {
    // This will be handled by the AuthContext - user will be automatically logged in
    // and the main app will be shown
  };

  switch (step) {
    case 0:
      return <WelcomeScreen onContinue={handleWelcomeContinue} onBackToLogin={onBackToLogin} />;
    case 1:
      return <NameInputScreen onNext={handleNameNext} onBack={() => setStep(0)} />;
    case 2:
      return <ContactMethodScreen onNext={handleContactNext} onBack={() => setStep(1)} />;
    case 3:
      return <PasswordScreen onNext={handlePasswordNext} onBack={() => setStep(2)} />;
    case 4:
      return <LoadingScreen onComplete={handleLoadingComplete} />;
    default:
      return <WelcomeScreen onContinue={handleWelcomeContinue} onBackToLogin={onBackToLogin} />;
  }
} 