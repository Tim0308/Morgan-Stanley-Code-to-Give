import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api, UserProfile } from "../lib/api";
import { useTranslation } from "../contexts/TranslationContext";
import SettingsMenu from "./SettingsMenu";
import EditProfile from "./EditProfile";
import LanguageDropdown from "./LanguageDropdown";

export default function Header() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const profile: UserProfile = await api.getUserProfile();
      console.log("✅ Profile reloaded in Header:", profile.name);
      setUserProfile(profile);

      // Mock token balance for now (in real app, this would come from API)
      setTokenBalance(150);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Set fallback data
      setUserProfile({
        id: "fallback-user",
        name: "User",
        email: "user@example.com",
        relationship: "parent",
        role: "parent",
      });
      setTokenBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSchoolInfo = () => {
    if (!userProfile?.children || userProfile.children.length === 0) {
      return { school: t.noSchool, grade: "N/A" };
    }

    const firstChild = userProfile.children[0];
    const school = firstChild.class?.name || "Sunny Hill";
    const grade = firstChild.class?.grade || firstChild.grade || "K3";

    return { school, grade };
  };

  const { school, grade } = getSchoolInfo();

  if (loading) {
    return (
      <View style={styles.header}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="white" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => {
              console.log(
                "Profile picture clicked, setting settings visible to true"
              );
              setSettingsVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.avatarText}>
              {getInitials(userProfile?.name || "User")}
            </Text>
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{userProfile?.name || "User"}</Text>
              <View style={styles.tokenContainer}>
                <Ionicons name="diamond" size={16} color="#fbbf24" />
                <Text style={styles.tokenText}>{tokenBalance}</Text>
              </View>
            </View>
            <View style={styles.locationContainer}>
              <Text style={styles.location}>{school}</Text>
              <View style={styles.grade}>
                <Text style={styles.gradeText}>{grade}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.rightSection}>
          <LanguageDropdown style={styles.languageDropdown} />

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <SettingsMenu
        visible={settingsVisible}
        onClose={() => {
          console.log("Settings menu closing, setting visible to false");
          setSettingsVisible(false);
        }}
        userProfile={{
          name: userProfile?.name || "User",
          email: userProfile?.email || userProfile?.phone || undefined,
        }}
        onProfileUpdated={() => {
          // Reload user data after profile update
          loadUserData();
        }}
        onEditProfilePress={() => {
          console.log("Edit profile pressed from settings menu");
          setEditProfileVisible(true);
        }}
      />

      <EditProfile
        visible={editProfileVisible}
        onClose={() => {
          console.log("EditProfile closing from Header");
          setEditProfileVisible(false);
        }}
        onProfileUpdated={() => {
          console.log("Profile updated from Header");
          setEditProfileVisible(false);
          loadUserData();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#406548ff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 14,
    marginLeft: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Allow userInfo to take available space
    marginRight: 10, // Add margin to prevent overlap with rightSection
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#666",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    // Add visual feedback for clickable state
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    justifyContent: "center",
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  tokenContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tokenText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    color: "#ccc",
    fontSize: 12,
    marginRight: 8,
  },
  grade: {
    backgroundColor: "#666",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  gradeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0, // Prevent shrinking
    minWidth: 100, // Ensure minimum width for proper spacing
  },
  languageDropdown: {
    marginRight: 12,
    maxWidth: 80, // Constrain width to prevent overflow
  },
  languageButton: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  languageText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 4,
  },
  notificationButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff4444",
  },
});
