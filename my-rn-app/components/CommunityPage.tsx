import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChildrenAchievements, Forums, Chats, Experts } from './index';
import { useTranslation } from '../contexts/TranslationContext';

export default function CommunityPage() {
  const { t } = useTranslation();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  
  const tabs = [
    { key: 'childrenAchievements', label: t.childrenAchievements, component: <ChildrenAchievements /> },
    { key: 'forums', label: t.forums, component: <Forums /> },
    { key: 'chats', label: t.chats, component: <Chats /> },
    { key: 'experts', label: t.experts, component: <Experts /> }
  ];

  const renderContent = () => {
    return tabs[selectedTabIndex].component;
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#f3f4f6',
  },
  selectedTab: {
    backgroundColor: '#1a1a2e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedTabText: {
    color: 'white',
  },
  spacer: {
    height: 20,
  },
}); 