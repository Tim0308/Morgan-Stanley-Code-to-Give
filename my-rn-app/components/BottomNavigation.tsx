import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../contexts/TranslationContext';

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  const { t } = useTranslation();

  const tabs = [
    { name: 'Home', icon: 'home', label: t.home },
    { name: 'Learn', icon: 'book', label: t.learn },
    { name: 'Community', icon: 'people', label: t.community },
    { name: 'Games', icon: 'game-controller', label: t.games },
    { name: 'Analytics', icon: 'bar-chart', label: t.analytics },
    { name: 'Tokens', icon: 'diamond', label: t.tokens },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={[
            styles.tab,
            currentPage === tab.name && styles.activeTab,
          ]}
          onPress={() => onPageChange(tab.name)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={currentPage === tab.name ? 'white' : '#666'}
          />
          <Text
            style={[
              styles.tabLabel,
              currentPage === tab.name && styles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 34, // Account for safe area on newer iPhones
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 12,
    minWidth: 0,
  },
  activeTab: {
    backgroundColor: '#1a1a2e',
  },
  tabLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: 'white',
  },
}); 