import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, BookletWithModules, UserProfile } from '../lib/api';

interface Task {
  type: 'pen-paper' | 'app';
  label: string;
  icon: string;
  actionIcon?: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface WorkItem {
  id: string;
  subject: string;
  title: string;
  date: string;
  tasks: Task[];
  backgroundColor: string;
  status: 'current' | 'completed';
}

export default function LearnPage() {
  const [selectedTab, setSelectedTab] = useState('Homework');
  const [booklets, setBooklets] = useState<BookletWithModules[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    loadLearnData();
  }, []);

  const loadLearnData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile to get children
      const userProfile: UserProfile = await api.getUserProfile();
      
      if (!userProfile.children || userProfile.children.length === 0) {
        // No children found, show empty state
        setBooklets([]);
        setLoading(false);
        return;
      }

      // Use first child for now
      const firstChild = userProfile.children[0];
      setSelectedChildId(firstChild.id);

      // Get booklets with activities
      const bookletsData = await api.getBooklets(firstChild.id);
      setBooklets(bookletsData || []);

    } catch (err) {
      console.error('Error loading learn data:', err);
      setError('Failed to load learning materials');
      setBooklets([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform booklets into work items
  const generateWorkItems = (): WorkItem[] => {
    const workItems: WorkItem[] = [];
    
    booklets.forEach((booklet) => {
      booklet.modules.forEach((module) => {
        module.activities.forEach((activity) => {
          // Convert activity to work item
          const tasks: Task[] = [
            {
              type: activity.type === 'pen_paper' ? 'pen-paper' : 'app',
              label: activity.type === 'pen_paper' ? 'Pen & Paper Work' : 'In-App Task',
              icon: activity.type === 'pen_paper' ? 'camera' : 'play-circle',
              actionIcon: activity.type === 'pen_paper' ? 'camera' : 'play',
              status: activity.status
            }
          ];

          const subjectColors: { [key: string]: string } = {
            'Reading': '#f0f9ff',
            'Math': '#fef3c7',
            'Science': '#f0fdf4',
            'Writing': '#faf5ff',
            'default': '#f9fafb'
          };

          workItems.push({
            id: activity.id,
            subject: booklet.subject || 'Learning',
            title: activity.title,
            date: new Date().toLocaleDateString('en-GB'),
            tasks,
            backgroundColor: subjectColors[booklet.subject || 'default'] || subjectColors.default,
            status: activity.status === 'completed' ? 'completed' : 'current'
          });
        });
      });
    });

    return workItems;
  };

  const workItems = generateWorkItems();
  const currentWork = workItems.filter(item => item.status === 'current');
  const completedWork = workItems.filter(item => item.status === 'completed');

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Learn</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading learning materials...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Learn</Text>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLearnData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Learn</Text>
      
      {/* Homework/Materials Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Homework' && styles.selectedTab,
          ]}
          onPress={() => setSelectedTab('Homework')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Homework' && styles.selectedTabText,
            ]}
          >
            Homework
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'Materials' && styles.selectedTab,
          ]}
          onPress={() => setSelectedTab('Materials')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'Materials' && styles.selectedTabText,
            ]}
          >
            Materials
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'Homework' ? (
        <View>
          {/* Current Work Section */}
          <View style={styles.sectionHeader}>
            <Ionicons name="timer-outline" size={20} color="#f97316" />
            <Text style={styles.sectionTitle}>Current Work</Text>
          </View>

          {currentWork.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text style={styles.emptyStateText}>All caught up!</Text>
              <Text style={styles.emptyStateSubtext}>No pending homework at the moment</Text>
            </View>
          ) : (
            currentWork.map((item) => (
              <View key={item.id} style={[styles.workCard, { backgroundColor: item.backgroundColor }]}>
                <View style={styles.workHeader}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                  </View>
                  <Text style={styles.workDate}>{item.date}</Text>
                </View>
                
                <Text style={styles.workTitle}>{item.title}</Text>
                
                <View style={styles.tasksContainer}>
                  {item.tasks.map((task, index) => (
                    <View key={index} style={styles.taskItem}>
                      <View style={styles.taskInfo}>
                        <Ionicons name={task.icon as any} size={16} color="#666" />
                        <Text style={styles.taskLabel}>{task.label}</Text>
                      </View>
                      <TouchableOpacity style={styles.taskAction}>
                        <Ionicons name={task.actionIcon as any} size={16} color="#1a1a2e" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}

          {/* Completed Work Section */}
          {completedWork.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={styles.sectionTitle}>Completed Work</Text>
              </View>

              {completedWork.slice(0, 3).map((item) => (
                <View key={item.id} style={[styles.workCard, styles.completedCard]}>
                  <View style={styles.workHeader}>
                    <View style={[styles.subjectBadge, styles.completedBadge]}>
                      <Text style={[styles.subjectText, styles.completedText]}>{item.subject}</Text>
                    </View>
                    <Text style={styles.workDate}>{item.date}</Text>
                  </View>
                  
                  <Text style={[styles.workTitle, styles.completedTitle]}>{item.title}</Text>
                  
                  <View style={styles.completedIndicator}>
                    <Ionicons name="checkmark" size={16} color="#22c55e" />
                    <Text style={styles.completedLabel}>Completed</Text>
                  </View>
                </View>
              ))}

              {completedWork.length > 3 && (
                <TouchableOpacity style={styles.showMoreButton}>
                  <Text style={styles.showMoreText}>
                    Show More ({completedWork.length - 3} more)
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      ) : (
        /* Materials Tab */
        <View style={styles.materialsSection}>
          {booklets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="library-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No materials available</Text>
              <Text style={styles.emptyStateSubtext}>Learning materials will appear here</Text>
            </View>
          ) : (
            booklets.map((booklet) => (
              <View key={booklet.id} style={styles.materialCard}>
                <View style={styles.materialHeader}>
                  <Ionicons name="book" size={24} color="#8b5cf6" />
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{booklet.title}</Text>
                    {booklet.subtitle && (
                      <Text style={styles.materialSubtitle}>{booklet.subtitle}</Text>
                    )}
                  </View>
                  <View style={styles.materialBadge}>
                    <Text style={styles.materialBadgeText}>{booklet.subject}</Text>
                  </View>
                </View>
                
                <Text style={styles.moduleCount}>
                  {booklet.modules.length} modules • {booklet.modules.reduce((acc, mod) => acc + mod.activities.length, 0)} activities
                </Text>
                
                <TouchableOpacity style={styles.viewMaterialButton}>
                  <Text style={styles.viewMaterialText}>View Material</Text>
                  <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedTabText: {
    color: '#1a1a2e',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  workCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completedCard: {
    backgroundColor: '#f9fafb',
    opacity: 0.8,
  },
  workHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#e5e7eb',
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  completedText: {
    color: '#666',
  },
  workDate: {
    fontSize: 12,
    color: '#666',
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  completedTitle: {
    color: '#666',
  },
  tasksContainer: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  taskAction: {
    padding: 4,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  completedLabel: {
    fontSize: 14,
    color: '#22c55e',
    marginLeft: 4,
    fontWeight: '500',
  },
  showMoreButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  showMoreText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  materialsSection: {
    marginBottom: 20,
  },
  materialCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  materialSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  materialBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  materialBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  moduleCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  viewMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewMaterialText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8b5cf6',
    marginRight: 4,
  },
}); 