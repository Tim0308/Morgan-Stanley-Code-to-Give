import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TabToggle() {
  const [selectedTab, setSelectedTab] = useState('Parent');

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Parent' && styles.selectedTab,
          ]}
          onPress={() => setSelectedTab('Parent')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Parent' && styles.selectedTabText,
            ]}
          >
            Parent
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Teacher' && styles.selectedTab,
          ]}
          onPress={() => setSelectedTab('Teacher')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Teacher' && styles.selectedTabText,
            ]}
          >
            Teacher
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedTab: {
    backgroundColor: '#1a1a2e',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedTabText: {
    color: 'white',
  },
}); 