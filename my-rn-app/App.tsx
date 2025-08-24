import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, ScrollView, ImageBackground } from "react-native";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CacheProvider, useCache } from "./contexts/CacheContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import { testConnection } from "./lib/api";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthNavigator from "./components/auth/AuthNavigator";
import SigningInRing from "./components/SigningInRing";
import DraggableExplainButton from "./components/DraggableExplainButton";
import Header from "./components/Header";
import TabToggle from "./components/TabToggle";
import WeeklyGoal from "./components/WeeklyGoal";
import BookletProgress from "./components/BookletProgress";
import PerformanceMetrics from "./components/PerformanceMetrics";
import CertificatesEarned from "./components/CertificatesEarned";
import BottomNavigation from "./components/BottomNavigation";
import LearnPage from "./components/LearnPage";
import CommunityPage from "./components/CommunityPage";
import GamesPage from "./components/GamesPage";
import AnalyticsPage from "./components/AnalyticsPage";
import TokensPage from "./components/TokensPage";

const COLORS = {
  primary: "#006e34",
  secondary: "#A6B84E",
  accent: "#C83E0A",
  light: "#F4F4F9",
  textDark: "#222",
  textLight: "#fff",
  border: "#e5e7eb",
  inputBg: "#F4F4F9",
};

function MainApp() {
  const [currentPage, setCurrentPage] = useState("Home");
  const { user, loading, isSigningIn } = useAuth();
  const { loadInitialData, isLoading: cacheLoading } = useCache();
  const screenRef = useRef<View>(null);

  // Load initial cache data when user logs in
  useEffect(() => {
    const initializeApp = async () => {
      if (user) {
        console.log("👤 User authenticated, initializing app data...");
        await testConnection();
        await loadInitialData();
      }
    };
    initializeApp();
  }, [user, loadInitialData]);

  // Show colorful loading ring ONLY when user clicks "Sign In"
  if (isSigningIn) {
    return <SigningInRing text="Signing In" />;
  }

  // Show basic loading only on initial app load (not after sign-in)
  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
      case "Learn":
        return <LearnPage />;
      case "Community":
        return <CommunityPage />;
      case "Games":
        return <GamesPage />;
      case "Analytics":
        return <AnalyticsPage />;
      case "Tokens":
        return <TokensPage />;
      case "Home":
      default:
        return (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* <TabToggle /> */}
            <WeeklyGoal />
            <BookletProgress />
            <PerformanceMetrics />
            <CertificatesEarned />
            <View style={styles.spacer} />
          </ScrollView>
        );
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ImageBackground
        source={require('./assets/backdrop.jpg')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.innerContainer} ref={screenRef} collapsable={false}>
          <StatusBar style="light" />
          <Header />

          {renderPage()}

          <BottomNavigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <DraggableExplainButton screenRef={screenRef} />
        </View>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <CacheProvider>
          <MainApp />
        </CacheProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.78)', // semi-transparent overlay for readability
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
  },
  spacer: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.accent,
  },
});