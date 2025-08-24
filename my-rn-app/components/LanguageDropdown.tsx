import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation, Language } from "../contexts/TranslationContext";

const { width } = Dimensions.get("window");

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

interface LanguageDropdownProps {
  style?: any;
  buttonStyle?: any;
  textStyle?: any;
  showOnAuth?: boolean; // Different styling for auth pages
}

export default function LanguageDropdown({
  style,
  buttonStyle,
  textStyle,
  showOnAuth = false,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useTranslation();

  const languageOptions: LanguageOption[] = [
    { code: "EN", label: "English", flag: "🇺🇸" },
    { code: "ZH", label: "繁體中文", flag: "🇭🇰" },
  ];

  const currentLanguage =
    languageOptions.find((lang) => lang.code === language) ||
    languageOptions[0];

  const handleLanguageSelect = async (selectedLanguage: Language) => {
    await setLanguage(selectedLanguage);
    setIsOpen(false);
  };

  const openDropdown = () => {
    setIsOpen(true);
  };

  const buttonStyles = showOnAuth
    ? [styles.authButton, buttonStyle]
    : [styles.button, buttonStyle];

  const textStyles = showOnAuth
    ? [styles.authButtonText, textStyle]
    : [styles.buttonText, textStyle];

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={buttonStyles}
        onPress={openDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{currentLanguage.flag}</Text>
        <Text style={textStyles}>{currentLanguage.code}</Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={showOnAuth ? "#666" : "#333"}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdown, styles.topRightDropdown]}>
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.code}
                style={[
                  styles.option,
                  language === option.code && styles.selectedOption,
                ]}
                onPress={() => handleLanguageSelect(option.code)}
              >
                <Text style={styles.flag}>{option.flag}</Text>
                <Text style={styles.optionText}>{option.label}</Text>
                {language === option.code && (
                  <Ionicons name="checkmark" size={20} color="#8b5cf6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxWidth: 80, // Constrain button width
  },
  authButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 100, // Constrain auth button width
    marginTop: 60, // Add margin for better spacing on auth screens
    marginRight: 20
  },
  buttonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 1,
  },
  authButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 8,
  },
  flag: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    minWidth: 200,
    maxWidth: width - 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topRightDropdown: {
    position: "absolute",
    top: 100, // Position below the header
    right: 20, // 20px from the right edge
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f0f9ff",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
});
