import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ImageBackground,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "../../contexts/TranslationContext";
import LanguageDropdown from "../LanguageDropdown";

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
}

export default function LoginScreen({ onSignUpPress }: LoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isSigningIn } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert(t.error, "Please enter your phone number and password.");
      return;
    }

    try {
      // Convert phone number to email format
      let loginEmail = `${phone.trim()}@reach.app`;
      await signIn(loginEmail, password.trim());
    } catch (error: any) {
      Alert.alert(t.loginFailed, error.message || t.invalidCredentials);
    }
  };

  const isValid = phone.trim().length > 0 && password.trim().length > 0;

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
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/icon5.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            
            {/* Language Dropdown */}
            <View style={styles.languageContainer}>
              <LanguageDropdown showOnAuth={true} />
            </View>

            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.welcomeBack}>{t.welcomeBack}</Text>
                <Text style={styles.title}>{t.signInToAccount}</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone number"
                    placeholderTextColor={COLORS.primary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t.password}
                    placeholderTextColor={COLORS.primary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
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
                    (!isValid || isSigningIn) && styles.disabledButtonText,
                  ]}
                >
                  {isSigningIn ? `${t.signIn}...` : t.signIn}
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.signUpText}>{t.dontHaveAccount} </Text>
                <TouchableOpacity onPress={onSignUpPress}>
                  <Text style={styles.signUpLink}>{t.signUp}</Text>
                </TouchableOpacity>
              </View>
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
    logoContainer: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 32,
  },
  logo: {
    width: 80,
    height: 80,
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
  languageContainer: {
    position: "absolute",
    top: -20,
    right: 0,
    zIndex: 1000,
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
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeBack: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 14,
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    marginBottom: 18,
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
  eyeButton: {
    padding: 4,
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  signUpLink: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: 600,
  },
});
