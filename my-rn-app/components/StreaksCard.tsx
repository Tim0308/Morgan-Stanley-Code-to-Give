import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StreaksCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="flame" size={24} color="#ff6b35" />
        <Text style={styles.title}>Parent Engagement Streaks</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
          <Text style={styles.statUnit}>days</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
          <Text style={styles.statUnit}>days</Text>
        </View>
      </View>
      
      <View style={styles.gamesSection}>
        <Text style={styles.gamesLabel}>Games This Week</Text>
        <View style={styles.gamesCountContainer}>
          <Ionicons name="game-controller" size={16} color="#ff6b35" />
          <Text style={styles.gamesCount}>5</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff5f2',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffe8e0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 14,
    color: '#666',
  },
  gamesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffe8e0',
  },
  gamesLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  gamesCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffe8e0',
  },
  gamesCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginLeft: 4,
  },
}); 