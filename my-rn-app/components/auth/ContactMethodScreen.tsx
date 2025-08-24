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
  ImageBackground,
} from "react-native";
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

interface ContactMethodScreenProps {
  onNext: (method: "phone" | "email", contact: string) => void;
  onBack?: () => void;
}

export default function ContactMethodScreen({
  onNext,
  onBack,
}: ContactMethodScreenProps) {
  const [contact, setContact] = useState("");

  const handleNext = () => {
    if (contact.trim()) {
      onNext("phone", contact.trim());
    }
  };

  const isValid = contact.trim().length > 0;

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
              {onBack && (
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
              <Text style={styles.title}>Contact Information</Text>
              <Text style={styles.subtitle}>
                Your information is private and only used for account creation
                and teacher identification.
              </Text>
              <View style={styles.phoneInputContainer}>
                <Ionicons
                  name="call"
                  size={22}
                  color={COLORS.primary}
                  style={styles.phoneIcon}
                />
                <TextInput
                  style={styles.contactInput}
                  placeholder="Enter phone number"
                  placeholderTextColor={COLORS.primary}
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={[styles.nextButton, isValid && styles.activeButton]}
                onPress={handleNext}
                disabled={!isValid}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    !isValid && styles.disabledButtonText,
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
    paddingTop: 60,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 4,
    position: "relative",
  },
  title: {
    fontSize: 24,
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
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    marginBottom: 32,
    width: "100%",
    height: 52,
    paddingHorizontal: 12,
  },
  phoneIcon: {
    marginRight: 8,
  },
  contactInput: {
    flex: 1,
    fontSize: 17,
    color: COLORS.primary,
    height: "100%",
  },
  nextButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: COLORS.secondary,
  },
  activeButton: {
    backgroundColor: COLORS.accent,
  },
  disabledButton: {
    backgroundColor: COLORS.secondary,
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
