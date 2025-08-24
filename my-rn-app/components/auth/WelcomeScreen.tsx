import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface WelcomeScreenProps {
  onContinue: () => void;
  onBackToLogin?: () => void;
}

export default function WelcomeScreen({
  onContinue,
  onBackToLogin,
}: WelcomeScreenProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onContinue}
      activeOpacity={1}
    >
      <ImageBackground
        source={require("../../assets/backdrop.jpg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.card}>
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Welcome to Reach Learning!</Text>
          <Text style={styles.subtitle}>
            We are excited for you to start your journey with us
          </Text>
          <View style={styles.footer}>
            <Text style={styles.continueText}>Press anywhere to continue</Text>
            {onBackToLogin && (
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={onBackToLogin}
              >
                <Text style={styles.backToLoginText}>
                  Already have an account? Sign in
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: height * 0.2,
    marginBottom: height * 0.25,
    shadowColor: "#006e34",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#006e34",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#222",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    opacity: 0.8,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: "100%",
  },
  continueText: {
    fontSize: 16,
    color: "#A6B84E",
    textAlign: "center",
  },
  backToLoginButton: {
    marginTop: 20,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: "#C83E0A",
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
