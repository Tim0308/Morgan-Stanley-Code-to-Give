import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { testConnection } from './lib/api';
import AuthNavigator from './components/auth/AuthNavigator';
import Header from './components/Header';
import TabToggle from './components/TabToggle';
import WeeklyGoal from './components/WeeklyGoal';
import BookletProgress from './components/BookletProgress';
import PerformanceMetrics from './components/PerformanceMetrics';
import CertificatesEarned from './components/CertificatesEarned';
import BottomNavigation from './components/BottomNavigation';
import LearnPage from './components/LearnPage';
import CommunityPage from './components/CommunityPage';
import GamesPage from './components/GamesPage';
import AnalyticsPage from './components/AnalyticsPage';
import TokensPage from './components/TokensPage';
import PageWrapper from './components/PageWrapper';
import ScreenshotTest from './components/ScreenshotTest';

function MainApp() {
  const [currentPage, setCurrentPage] = useState('Home');
  const { user, loading } = useAuth();
  const [testMode, setTestMode] = useState(false); // Temporary test mode

  // Test backend connection on app start
  useEffect(() => {
    const checkConnection = async () => {
      if (user) {
        await testConnection();
      }
    };
    checkConnection();
  }, [user]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  // Show test mode if enabled
  if (testMode) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScreenshotTest />
      </View>
    );
  }

  // Show auth navigator if user is not authenticated
  if (!user) {
    return <AuthNavigator />;
  }

  // Show main app for authenticated users
  const renderPage = () => {
    switch (currentPage) {
      case 'Learn':
        return (
          <PageWrapper>
            <LearnPage />
          </PageWrapper>
        );
      case 'Community':
        return (
          <PageWrapper>
            <CommunityPage />
          </PageWrapper>
        );
      case 'Games':
        return (
          <PageWrapper>
            <GamesPage />
          </PageWrapper>
        );
      case 'Analytics':
        return (
          <PageWrapper>
            <AnalyticsPage />
          </PageWrapper>
        );
      case 'Tokens':
        return (
          <PageWrapper>
            <TokensPage />
          </PageWrapper>
        );
      case 'Home':
      default:
        return (
          <PageWrapper>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <TabToggle />
              <WeeklyGoal />
              <BookletProgress />
              <PerformanceMetrics />
              <CertificatesEarned />
              <View style={styles.spacer} />
            </ScrollView>
          </PageWrapper>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header />
      
      {renderPage()}
      
      <BottomNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  spacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
