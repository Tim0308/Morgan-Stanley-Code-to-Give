import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Chat {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timeAgo: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export default function Chats() {
  const teachers: Chat[] = [
    {
      id: '1',
      name: 'Teacher Kim',
      initials: 'TK',
      lastMessage: 'Remember homework is due tomorrow',
      timeAgo: '3h ago',
      unreadCount: 1,
      isOnline: true,
    },
  ];

  const parents: Chat[] = [
    {
      id: '1',
      name: 'Mr. Wong',
      initials: 'MW',
      lastMessage: 'How is your child doing with spelling?',
      timeAgo: '1d ago',
      unreadCount: 2,
    },
    {
      id: '2',
      name: 'Mrs. Chen',
      initials: 'MC',
      lastMessage: 'Thanks for the reading tips!',
      timeAgo: '2h ago',
      isOnline: true,
    },
  ];

  const renderChatItem = (chat: Chat) => (
    <TouchableOpacity key={chat.id} style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{chat.initials}</Text>
        </View>
        {chat.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chat.name}</Text>
          <Text style={styles.timeAgo}>{chat.timeAgo}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
      </View>
      
      {chat.unreadCount && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* New Chat Button */}
      <TouchableOpacity style={styles.newChatButton}>
        <Ionicons name="people" size={20} color="#666" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      {/* Teachers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teachers</Text>
        {teachers.map(renderChatItem)}
      </View>

      {/* Parents Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Parents</Text>
        {parents.map(renderChatItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  newChatText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    fontSize: 16,
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
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeAgo: {
    fontSize: 14,
    color: '#9ca3af',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
}); 