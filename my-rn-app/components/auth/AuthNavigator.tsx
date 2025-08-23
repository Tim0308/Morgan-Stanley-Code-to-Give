import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import OnboardingFlow from './OnboardingFlow';

export default function AuthNavigator() {
  const [showLogin, setShowLogin] = useState(true); // Start with login for returning users

  if (showLogin) {
    return (
      <LoginScreen 
        onSignUpPress={() => setShowLogin(false)} 
      />
    );
  }

  return (
    <OnboardingFlow 
      onBackToLogin={() => setShowLogin(true)}
    />
  );
} 