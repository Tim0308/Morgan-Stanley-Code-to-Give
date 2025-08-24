import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, CommunityPost } from '../lib/api';
import { useTranslation } from '../contexts/TranslationContext';

interface Achievement {
  id: string;
  authorName: string;
  school: string;
  grade: string;
  content: string;
  mediaType: 'photo' | 'video' | null;
  likes: number;
  timeAgo: string;
}

export default function ChildrenAchievements() {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const feed = await api.getCommunityFeed();
      setAchievements(feed.posts.map((post: CommunityPost) => ({
        id: post.id,
        authorName: post.author.name,
        school: post.author.name, // Using author name as placeholder
        grade: 'K1', // Default grade
        content: post.content,
        mediaType: null as 'photo' | 'video' | null,
        likes: post.likes,
        timeAgo: new Date(post.created_at).toLocaleString(),
      })));
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#f59e0b" />
        <Text style={styles.title}>{t.childrenAchievements}</Text>
      </View>
      
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievementCard}>
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(achievement.authorName)}
                </Text>
              </View>
              <View style={styles.authorDetails}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{achievement.authorName}</Text>
                  <Text style={styles.schoolInfo}>{achievement.school}</Text>
                  <Text style={styles.gradeInfo}>{achievement.grade}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <Text style={styles.content}>{achievement.content}</Text>
          
          {achievement.mediaType && (
            <View style={styles.mediaContainer}>
              <View style={styles.mediaPlaceholder}>
                <Ionicons 
                  name={achievement.mediaType === 'photo' ? 'camera' : 'videocam'} 
                  size={40} 
                  color="#9ca3af" 
                />
                <Text style={styles.mediaText}>
                  {achievement.mediaType === 'photo' ? t.photoAttached : t.videoAttached}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.postFooter}>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={20} color="#666" />
              <Text style={styles.likeCount}>{achievement.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commentButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.commentText}>{t.showComments}</Text>
            </TouchableOpacity>
            
            <Text style={styles.timeAgo}>{achievement.timeAgo}</Text>
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
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 8,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  postHeader: {
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  schoolInfo: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  gradeInfo: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 12,
  },
  mediaPlaceholder: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  mediaText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 14,
    color: '#9ca3af',
  },
});