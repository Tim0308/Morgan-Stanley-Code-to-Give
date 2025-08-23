import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Expert {
  id: string;
  name: string;
  initials: string;
  school: string;
  grade: string;
  badge: string;
  helpfulAnswers: number;
  expertise: string[];
  isOnline?: boolean;
  lastSeen?: string;
  icons: string[];
}

export default function Experts() {
  const experts: Expert[] = [
    {
      id: '1',
      name: 'Mrs. Chen',
      initials: 'M',
      school: 'Sunny Hills',
      grade: 'K1',
      badge: 'Top Expert',
      helpfulAnswers: 23,
      expertise: ['Reading', 'Listening'],
      isOnline: true,
      icons: ['book', 'bulb'],
    },
    {
      id: '2',
      name: 'Mr. Wong',
      initials: 'M',
      school: 'Rainbow Learning',
      grade: 'K2',
      badge: 'Top Expert',
      helpfulAnswers: 18,
      expertise: ['Writing'],
      lastSeen: '2h ago',
      icons: ['pencil'],
    },
    {
      id: '3',
      name: 'Mrs. Li',
      initials: 'M',
      school: 'Bright Stars',
      grade: 'K1',
      badge: '',
      helpfulAnswers: 15,
      expertise: ['Spelling', 'Reading'],
      isOnline: true,
      icons: ['library', 'book'],
    },
  ];

  const getBadgeColor = (badge: string) => {
    return badge === 'Top Expert' ? '#f59e0b' : '#9ca3af';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="school" size={20} color="#3b82f6" />
        <Text style={styles.title}>Expert Parents</Text>
      </View>
      
      {experts.map((expert) => (
        <View key={expert.id} style={styles.expertCard}>
          <View style={styles.expertHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{expert.initials}</Text>
              </View>
              {expert.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            
            <View style={styles.expertInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.expertName}>{expert.name}</Text>
                {expert.badge && (
                  <View style={styles.badge}>
                    <Text style={[styles.badgeText, { color: getBadgeColor(expert.badge) }]}>
                      {expert.badge}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.iconsRow}>
                {expert.icons.map((icon, index) => (
                  <Ionicons key={index} name={icon as any} size={16} color="#f59e0b" style={styles.expertIcon} />
                ))}
                <Text style={styles.helpfulAnswers}>{expert.helpfulAnswers} helpful answers</Text>
              </View>
              
              <View style={styles.locationRow}>
                <Text style={styles.schoolInfo}>{expert.school}</Text>
                <Text style={styles.gradeInfo}>{expert.grade}</Text>
                {expert.isOnline ? (
                  <View style={styles.onlineStatus}>
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                ) : (
                  <Text style={styles.lastSeenText}>Last seen {expert.lastSeen}</Text>
                )}
              </View>
              
              <Text style={styles.expertise}>Expertise: {expert.expertise.join(', ')}</Text>
            </View>
            
            <TouchableOpacity style={styles.chatButton}>
              <Ionicons name="chatbubble" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  expertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: 'white',
  },
  expertInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expertIcon: {
    marginRight: 4,
  },
  helpfulAnswers: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  schoolInfo: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  gradeInfo: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  lastSeenText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  expertise: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  chatButton: {
    backgroundColor: '#1a1a2e',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
}); 