import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, WeeklyProgress } from '../lib/api';
import { useTranslation } from '../contexts/TranslationContext';

export default function WeeklyGoal() {
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    loadWeeklyProgress();
  }, []);

  const loadWeeklyProgress = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile to get children
      const userProfile = await api.getUserProfile();
      
      if (!userProfile.children || userProfile.children.length === 0) {
        // No children, show empty state
        setCompleted(0);
        setTotal(0);
        setLoading(false);
        return;
      }

      // Get weekly progress for first child
      const firstChild = userProfile.children[0];
      const weeklyProgress = await api.getWeeklyProgress(firstChild.id, 1);
      
      if (weeklyProgress && weeklyProgress.length > 0) {
        const currentWeek = weeklyProgress[0];
        setCompleted(currentWeek.completed_activities);
        setTotal(currentWeek.total_activities);
      } else {
        // No progress data, show empty state
        setCompleted(0);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error loading weekly progress:', err);
      setError(`${t.failed} ${t.weeklyGoal.toLowerCase()}`);
      // Show empty state on error
      setCompleted(0);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              </View>
              <Text style={styles.title}>{t.weeklyGoal}</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.loadingText}>{t.loading}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="warning-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.title}>{t.weeklyGoal}</Text>
            </View>
            <TouchableOpacity onPress={loadWeeklyProgress}>
              <Ionicons name="refresh" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            </View>
            <Text style={styles.title}>{t.weeklyGoal}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {total > 0 ? `${completed}/${total} ${t.activities} ${t.completed}` : t.noActivitiesThisWeek}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1a1a2e',
    borderRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    paddingVertical: 10,
  },
}); 