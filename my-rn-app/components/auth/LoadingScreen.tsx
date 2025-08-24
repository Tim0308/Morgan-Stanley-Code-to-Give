import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

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

interface LoginScreenProps {
  onSignUpPress: () => void;
  onLogin?: (email: string, password: string) => void;
}

export default function LoginScreen({
  onSignUpPress,
  onLogin,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {
    if (isValid && onLogin) {
      onLogin(email.trim(), password.trim());
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/backdrop.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Please log in to your account</Text>

              <View style={styles.inputGroup}>
                <Ionicons
                  name="mail"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={COLORS.primary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.primary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isValid ? styles.activeButton : styles.disabledButton,
                ]}
                onPress={handleLogin}
                disabled={!isValid}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.loginButtonText,
                    !isValid && styles.disabledButtonText,
                  ]}
                >
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signUpLink}
                onPress={onSignUpPress}
              >
                <Text style={styles.signUpText}>
                  Don't have an account?{" "}
                  <Text style={styles.signUpTextAccent}>Sign Up</Text>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: COLORS.light,
    borderRadius: 28,
    padding: 32,
    paddingTop: 40,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textDark,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    opacity: 0.8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    marginBottom: 18,
    width: "100%",
    height: 52,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: COLORS.primary,
    height: "100%",
  },
  loginButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  activeButton: {
    backgroundColor: COLORS.accent,
  },
  disabledButton: {
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  signUpLink: {
    marginTop: 22,
  },
  signUpText: {
    color: COLORS.primary,
    fontSize: 15,
    textAlign: "center",
  },
  signUpTextAccent: {
    color: COLORS.accent,
    fontWeight: "bold",
  },
});
