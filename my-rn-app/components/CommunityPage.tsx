import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChildrenAchievements, Forums, Chats, Experts } from './index';

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState('Children Achievements');

  const tabs = [
    'Children Achievements',
    'Forums',
    'Chats',
    'Experts'
  ];

  const renderContent = () => {
    switch (selectedTab) {
      case 'Children Achievements':
        return <ChildrenAchievements />;
      case 'Forums':
        return <Forums />;
      case 'Chats':
        return <Chats />;
      case 'Experts':
        return <Experts />;
      default:
        return <ChildrenAchievements />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Community</Text>
      
      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.selectedTabText,
              ]}
            >
              {tab}
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