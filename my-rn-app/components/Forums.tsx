import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../lib/api';

interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: string;
  timeAgo: string;
  likes: number;
  comments: number;
  hasReply?: boolean;
  isLiked?: boolean;
}

export default function Forums() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForumPosts();
  }, []);

  const loadForumPosts = async () => {
    try {
      // Load from API or use mock data for now
      setDiscussions([
        {
          id: '1',
          title: 'Best ways to teach letter recognition?',
          content: 'My child is struggling to remember the difference between b and d. Any tips?',
          author: 'Mrs. Chen',
          timeAgo: '2h ago',
          likes: 12,
          comments: 8,
          hasReply: true,
          isLiked: false,
        },
        {
          id: '2',
          title: 'Phonics activities that actually work',
          content: 'Looking for engaging phonics games that kept your child interested.',
          author: 'Anonymous',
          timeAgo: '1d ago',
          likes: 7,
          comments: 5,
          hasReply: true,
          isLiked: false,
        },
      ]);
    } catch (error) {
      console.error('Failed to load forum posts:', error);
    }
  };

  const handleLike = async (discussionId: string) => {
    try {
      // Update UI immediately for better UX
      setDiscussions(prev => prev.map(discussion => {
        if (discussion.id === discussionId) {
          const wasLiked = discussion.isLiked || false;
          return {
            ...discussion,
            isLiked: !wasLiked,
            likes: wasLiked ? discussion.likes - 1 : discussion.likes + 1
          };
        }
        return discussion;
      }));

      // Call API
      await api.toggleLike(discussionId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert optimistic update on error
      loadForumPosts();
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post.');
      return;
    }
    
    setLoading(true);
    try {
      await api.createPost(newPostContent.trim(), 'question');
      setNewPostContent('');
      Alert.alert('Success', 'Your post has been created!');
      // Refresh the discussions
      loadForumPosts();
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories: ForumCategory[] = [
    {
      id: '1',
      name: 'Alphabet Time',
      icon: 'library',
      color: '#1a1a2e',
    },
    {
      id: '2',
      name: 'Vocabulary Time',
      icon: 'book',
      color: '#22c55e',
    },
    {
      id: '3',
      name: 'Sight Words Time',
      icon: 'eye',
      color: '#8b5cf6',
    },
    {
      id: '4',
      name: 'Reading Time',
      icon: 'reader',
      color: '#3b82f6',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.selectedCategoryHeader}>
          <View style={styles.categoryIcon}>
            <Ionicons name="library" size={24} color="white" />
          </View>
          <Text style={styles.selectedCategoryTitle}>Alphabet Time - General Discussion</Text>
        </View>
        
        <View style={styles.categoriesList}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <View style={[styles.categoryIconSmall, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={16} color="white" />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Discussions */}
      <View style={styles.discussionsContainer}>
        {discussions.map((discussion) => (
          <View key={discussion.id} style={styles.discussionCard}>
            <View style={styles.discussionHeader}>
              <Text style={styles.discussionTitle}>{discussion.title}</Text>
              {discussion.hasReply && (
                <View style={styles.replyBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text style={styles.replyText}>Rep</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.discussionContent}>{discussion.content}</Text>
            
            <View style={styles.discussionFooter}>
              <View style={styles.authorInfo}>
                <Text style={styles.authorText}>by {discussion.author}</Text>
                <Text style={styles.timeText}>{discussion.timeAgo}</Text>
              </View>
              
              <View style={styles.engagement}>
                <TouchableOpacity 
                  style={styles.engagementItem}
                  onPress={() => handleLike(discussion.id)}
                >
                  <Ionicons 
                    name={discussion.isLiked ? "heart" : "heart-outline"} 
                    size={16} 
                    color={discussion.isLiked ? "#ef4444" : "#666"} 
                  />
                  <Text style={[
                    styles.engagementText,
                    discussion.isLiked && { color: "#ef4444" }
                  ]}>{discussion.likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.engagementItem}>
                  <Ionicons name="chatbubble-outline" size={16} color="#666" />
                  <Text style={styles.engagementText}>{discussion.comments}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Share your thoughts about Alphabet Time..."
          placeholderTextColor="#9ca3af"
          multiline
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <TouchableOpacity 
          style={[
            styles.postButton,
            !newPostContent.trim() && styles.postButtonDisabled
          ]}
          onPress={handleCreatePost}
          disabled={loading || !newPostContent.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={!newPostContent.trim() ? "#ccc" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  selectedCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  categoryName: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  discussionsContainer: {
    marginBottom: 20,
  },
  discussionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  replyText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
    marginLeft: 4,
  },
  discussionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  engagement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  engagementText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    minHeight: 40,
    textAlignVertical: 'top',
    marginRight: 12,
  },
  postButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
}); 