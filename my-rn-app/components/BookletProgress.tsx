import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, BookletProgress as BookletProgressType } from '../lib/api';

interface ProgressItemProps {
  title: string;
  completed: number;
  total: number;
  currentModule: number;
  timeRemaining: string;
  progress: number;
}

function ProgressItem({ title, completed, total, currentModule, timeRemaining, progress }: ProgressItemProps) {
  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{title}</Text>
        <Text style={styles.progressStats}>{completed}/{total} modules completed</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
      
      <View style={styles.progressFooter}>
        <Text style={styles.currentModule}>Current Module: {currentModule}</Text>
        <Text style={styles.timeRemaining}>{timeRemaining}</Text>
      </View>
    </View>
  );
}

export default function BookletProgress() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressData, setProgressData] = useState<ProgressItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get user profile to get children
      const userProfile = await api.getUserProfile();
      
      if (!userProfile.children || userProfile.children.length === 0) {
        // No children found, show empty state
        setProgressData([
          { title: 'Vocabulary Time', completed: 0, total: 20, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
          { title: 'Sight Words Time', completed: 0, total: 15, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
          { title: 'Reading Time', completed: 0, total: 24, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
          { title: 'Phonics Time', completed: 0, total: 18, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
        ]);
        setLoading(false);
        return;
      }

      // Use first child for now
      const firstChild = userProfile.children[0];
      setSelectedChildId(firstChild.id);

      // Get booklet progress for the child
      const bookletProgress = await api.getBookletProgress(firstChild.id);
      
      if (bookletProgress && bookletProgress.length > 0) {
        // Transform backend data to component format
        const transformedData = bookletProgress.map((item: BookletProgressType) => ({
          title: item.booklet_name,
          completed: item.completed_modules,
          total: item.total_modules,
          currentModule: item.current_module,
          timeRemaining: item.estimated_completion_time || 'N/A',
          progress: item.progress_percentage,
        }));

        // Ensure we have the 4 categories, pad with defaults if needed
        const defaultCategories = [
          'Vocabulary Time',
          'Sight Words Time', 
          'Reading Time',
          'Phonics Time'
        ];

                 const finalData = defaultCategories.map((categoryName, index) => {
           const found = transformedData.find((item: any) => 
             item.title.toLowerCase().includes(categoryName.toLowerCase().split(' ')[0])
           );
          
          if (found) {
            return found;
          }
          
          // Return default empty state for missing categories
          return {
            title: categoryName,
            completed: 0,
            total: [20, 15, 24, 18][index], // Default totals for each category
            currentModule: 0,
            timeRemaining: 'N/A',
            progress: 0,
          };
        });

        setProgressData(finalData);
      } else {
        // No progress data, show empty state
        setProgressData([
          { title: 'Vocabulary Time', completed: 0, total: 20, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
          { title: 'Sight Words Time', completed: 0, total: 15, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
          { title: 'Reading Time', completed: 0, total: 24, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
          { title: 'Phonics Time', completed: 0, total: 18, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
        ]);
      }
    } catch (err) {
      console.error('Error loading booklet progress:', err);
      setError('Failed to load progress data');
      // Show empty state on error
      setProgressData([
        { title: 'Vocabulary Time', completed: 0, total: 20, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
        { title: 'Sight Words Time', completed: 0, total: 15, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
        { title: 'Reading Time', completed: 0, total: 24, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
        { title: 'Phonics Time', completed: 0, total: 18, currentModule: 0, timeRemaining: 'N/A', progress: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : progressData.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < progressData.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Booklet Progress</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Booklet Progress</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentItem = progressData[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Booklet Progress</Text>
        <View style={styles.pagination}>
          <TouchableOpacity onPress={handlePrevious}>
            <Ionicons name="chevron-back" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.paginationText}>{currentIndex + 1}/{progressData.length}</Text>
          <TouchableOpacity onPress={handleNext}>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      <ProgressItem
        title={currentItem.title}
        completed={currentItem.completed}
        total={currentItem.total}
        currentModule={currentItem.currentModule}
        timeRemaining={currentItem.timeRemaining}
        progress={currentItem.progress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  progressItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  progressStats: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentModule: {
    fontSize: 14,
    color: '#666',
  },
  timeRemaining: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    backgroundColor: '#f8f9fa',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
}); 