import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { ChildrenAchievements, Forums, Chats, Experts } from "./index";
import { useTranslation } from "../contexts/TranslationContext";

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

export default function CommunityPage() {
  const { t } = useTranslation();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const tabs = [
    {
      key: "childrenAchievements",
      label: t.childrenAchievements,
      component: <ChildrenAchievements />,
    },
    { key: "forums", label: t.forums, component: <Forums /> },
    { key: "chats", label: t.chats, component: <Chats /> },
    { key: "experts", label: t.experts, component: <Experts /> },
  ];

  const renderContent = () => {
    return tabs[selectedTabIndex].component;
  };

  return (
    <ImageBackground
      source={require("../assets/backdrop.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{t.community}</Text>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTabIndex === index && styles.selectedTab,
              ]}
              onPress={() => setSelectedTabIndex(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTabIndex === index && styles.selectedTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        {renderContent()}

        <View style={styles.spacer} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(244,244,249,0.9)", // COLORS.light with opacity for readability
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tabScrollView: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  tabContainer: {
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#d3de98ff",
  },
  selectedTab: {
    backgroundColor: "#e17046ff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.textDark,
  },
  selectedTabText: {
    color: COLORS.textLight,
  },
  spacer: {
    height: 20,
  },
});
