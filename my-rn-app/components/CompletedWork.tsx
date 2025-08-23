import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Task {
  type: 'pen-paper' | 'app';
  label: string;
  icon: string;
  completed: boolean;
}

interface CompletedWorkItem {
  subject: string;
  title: string;
  tasks: Task[];
  backgroundColor: string;
}

export default function CompletedWork() {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedItems: CompletedWorkItem[] = [
    {
      subject: 'Reading',
      title: 'Alphabet Practice A-E',
      backgroundColor: '#f0fdf4',
      tasks: [
        {
          type: 'pen-paper',
          label: 'Pen & Paper Work',
          icon: 'create-outline',
          completed: true,
        },
        {
          type: 'app',
          label: 'In-App Task',
          icon: 'phone-portrait-outline',
          completed: true,
        },
      ],
    },
    {
      subject: 'Writing',
      title: 'Writing Practice: Simple Sentences',
      backgroundColor: '#f0fdf4',
      tasks: [
        {
          type: 'pen-paper',
          label: 'Pen & Paper Work',
          icon: 'create-outline',
          completed: true,
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
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.title}>Completed Work</Text>
        <View style={styles.headerRight}>
          <Text style={styles.hideText}>Hide Completed Work</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666" 
          />
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.expandedContent}>
          {completedItems.map((item, index) => (
            <View key={index} style={[styles.workCard, { backgroundColor: item.backgroundColor }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.subjectText, { color: getSubjectColor(item.subject) }]}>
                  {item.subject}
                </Text>
              </View>
              
              <Text style={styles.workTitle}>{item.title}</Text>
              
              {item.tasks.map((task, taskIndex) => (
                <View key={taskIndex} style={styles.taskRow}>
                  <View style={styles.taskInfo}>
                    <Ionicons name={task.icon as any} size={20} color="#666" />
                    <Text style={styles.taskLabel}>{task.label}</Text>
                  </View>
                  
                  <View style={styles.completedIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                  </View>
                </View>
              ))}
              
              <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.completedButton}>
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hideText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  expandedContent: {
    marginTop: 8,
  },
  workCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
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
    marginBottom: 12,
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
  completedIcon: {
    padding: 4,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  completedButton: {
    padding: 4,
  },
}); 