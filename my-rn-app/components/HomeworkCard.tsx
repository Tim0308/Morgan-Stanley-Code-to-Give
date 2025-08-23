import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  type: 'pen-paper' | 'app';
  label: string;
  status: 'uploaded' | 'complete' | 'pending' | 'progress';
  hasPhoto?: boolean;
}

interface HomeworkCardProps {
  type: string;
  difficulty: string;
  xp: number;
  title: string;
  week: string;
  status: string;
  tasks: Task[];
  rating: number;
}

export default function HomeworkCard({
  type,
  difficulty,
  xp,
  title,
  week,
  status,
  tasks,
  rating,
}: HomeworkCardProps) {
  const isCompleted = rating > 0;
  const cardBackgroundColor = isCompleted ? '#f0fdf4' : '#ffffff';
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return '#22c55e';
      case 'Medium':
        return '#1a1a2e';
      case 'Hard':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const getTaskIcon = (taskType: string) => {
    return taskType === 'pen-paper' ? 'create-outline' : 'phone-portrait-outline';
  };

  const getStatusButton = (task: Task) => {
    switch (task.status) {
      case 'uploaded':
        return (
          <View style={[styles.statusButton, styles.uploadedButton]}>
            <Text style={styles.uploadedText}>Uploaded</Text>
          </View>
        );
      case 'complete':
        return (
          <View style={[styles.statusButton, styles.completeButton]}>
            <Text style={styles.completeText}>Complete!</Text>
          </View>
        );
      case 'pending':
        return task.hasPhoto ? (
          <View style={styles.pendingActions}>
            <TouchableOpacity style={styles.photoButton}>
              <Ionicons name="camera" size={16} color="#666" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}>
              <Ionicons name="arrow-up" size={16} color="white" />
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusButton, styles.pendingButton]}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        );
      case 'progress':
        return (
          <TouchableOpacity style={[styles.statusButton, styles.progressButton]}>
            <Text style={styles.progressText}>Complete Task</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderStars = (count: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= count ? 'star' : 'star-outline'}
            size={16}
            color={star <= count ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{type}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(difficulty) }]}>
            <Text style={styles.difficultyBadgeText}>{difficulty}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={14} color="#fbbf24" />
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.weekContainer}>
        <Text style={styles.week}>{week}</Text>
        {status === 'overdue' && (
          <View style={styles.overdueContainer}>
            <Ionicons name="calendar" size={14} color="#ef4444" />
            <Text style={styles.overdueText}>Overdue</Text>
          </View>
        )}
      </View>

      {/* Tasks */}
      {tasks.map((task, index) => (
        <View key={index} style={styles.taskRow}>
          <View style={styles.taskInfo}>
            <Ionicons name={getTaskIcon(task.type)} size={20} color="#666" />
            <Text style={styles.taskLabel}>{task.label}</Text>
          </View>
          {getStatusButton(task)}
        </View>
      ))}

      {/* Rating */}
      {rating > 0 ? (
        <View style={styles.ratingContainer}>
          {renderStars(rating)}
          <TouchableOpacity style={[styles.statusButton, styles.completeButton]}>
            <Text style={styles.completeText}>Complete!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ratingContainer}>
          {renderStars(0)}
          <Text style={styles.inProgressText}>In Progress</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#ea580c',
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  weekContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  week: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  overdueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overdueText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskLabel: {
    fontSize: 14,
    color: '#333',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  uploadedButton: {
    backgroundColor: '#22c55e',
  },
  uploadedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#22c55e',
  },
  completeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  pendingButton: {
    backgroundColor: '#f3f4f6',
  },
  pendingText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  progressButton: {
    backgroundColor: '#1a1a2e',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  photoButtonText: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  submitButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  inProgressText: {
    fontSize: 14,
    color: '#666',
  },
}); 