import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  type: 'pen-paper' | 'app';
  label: string;
  icon: string;
  actionIcon?: string;
}

interface WorkItem {
  subject: string;
  title: string;
  date: string;
  tasks: Task[];
  backgroundColor: string;
}

export default function CurrentWork() {
  const workItems: WorkItem[] = [
    {
      subject: 'Reading',
      title: 'Listening Exercise: Animal Sounds',
      date: '25/08/2025',
      backgroundColor: '#f0f9ff',
      tasks: [
        {
          type: 'app',
          label: 'In-App Task',
          icon: 'phone-portrait-outline',
          actionIcon: 'play-circle',
        },
      ],
    },
    {
      subject: 'Writing',
      title: 'Vocabulary: Animals',
      date: '30/08/2025',
      backgroundColor: '#f0fdf4',
      tasks: [
        {
          type: 'pen-paper',
          label: 'Pen & Paper Work',
          icon: 'create-outline',
          actionIcon: 'camera',
        },
        {
          type: 'app',
          label: 'In-App Task',
          icon: 'phone-portrait-outline',
          actionIcon: 'play-circle',
        },
      ],
    },
  ];

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Reading':
        return '#3b82f6';
      case 'Writing':
        return '#22c55e';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Work</Text>
      
      {workItems.map((item, index) => (
        <View key={index} style={[styles.workCard, { backgroundColor: item.backgroundColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.subjectText, { color: getSubjectColor(item.subject) }]}>
              {item.subject}
            </Text>
          </View>
          
          <Text style={styles.workTitle}>{item.title}</Text>
          
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          
          {item.tasks.map((task, taskIndex) => (
            <View key={taskIndex} style={styles.taskRow}>
              <View style={styles.taskInfo}>
                <Ionicons name={task.icon as any} size={20} color="#666" />
                <Text style={styles.taskLabel}>{task.label}</Text>
              </View>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons 
                  name={task.actionIcon as any} 
                  size={20} 
                  color={task.actionIcon === 'play-circle' ? '#333' : '#666'} 
                />
              </TouchableOpacity>
            </View>
          ))}
          
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.completeButton}>
              <Ionicons name="checkmark-circle" size={20} color="#9ca3af" />
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  workCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  workTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  completeButton: {
    padding: 4,
  },
}); 