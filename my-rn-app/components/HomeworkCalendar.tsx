import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeworkCalendar() {
  const weeks = [
    {
      week: 'Week 1',
      dates: '12-18 Aug',
      tasks: '2 tasks',
      status: 'completed',
      icon: 'checkmark',
    },
    {
      week: 'Week 2',
      dates: '19-25 Aug',
      tasks: '2 tasks',
      status: 'current',
      icon: 'time',
    },
    {
      week: 'Week 3',
      dates: '26 Aug - 1 Sep',
      tasks: '3 tasks',
      status: 'upcoming',
      number: '3',
    },
    {
      week: 'Week 4',
      dates: '2-8 Sep',
      tasks: '2 tasks',
      status: 'upcoming',
      number: '4',
    },
  ];

  const getCircleStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: '#dcfce7',
          borderColor: '#22c55e',
        };
      case 'current':
        return {
          backgroundColor: '#e0e7ff',
          borderColor: '#6366f1',
        };
      case 'upcoming':
      default:
        return {
          backgroundColor: '#f3f4f6',
          borderColor: '#9ca3af',
        };
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'current':
        return '#6366f1';
      case 'upcoming':
      default:
        return '#9ca3af';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homework Calendar</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {weeks.map((week, index) => (
          <View key={index} style={styles.weekItem}>
            <View style={[styles.circle, getCircleStyle(week.status)]}>
              {week.icon ? (
                <Ionicons 
                  name={week.icon as any} 
                  size={24} 
                  color={getIconColor(week.status)} 
                />
              ) : (
                <Text style={[styles.circleNumber, { color: getIconColor(week.status) }]}>
                  {week.number}
                </Text>
              )}
            </View>
            <Text style={styles.weekText}>{week.week}</Text>
            <Text style={styles.datesText}>{week.dates}</Text>
            <Text style={styles.tasksText}>{week.tasks}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollView: {
    paddingLeft: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  weekItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  datesText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  tasksText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
}); 