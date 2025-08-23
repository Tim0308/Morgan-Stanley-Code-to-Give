import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeeklyProgressChart() {
  const data = [
    { week: 'Week 1', value: 4, maxValue: 8, completed: true },
    { week: 'Week 2', value: 3, maxValue: 8, completed: true },
    { week: 'Week 3', value: 5, maxValue: 8, completed: false },
    { week: 'Week 4', value: 2, maxValue: 8, completed: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Weekly Progress</Text>
        
        <View style={styles.chartContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>8</Text>
            <Text style={styles.yAxisLabel}>6</Text>
            <Text style={styles.yAxisLabel}>4</Text>
            <Text style={styles.yAxisLabel}>2</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          
          {/* Chart bars */}
          <View style={styles.barsContainer}>
            {data.map((item, index) => {
              const barHeight = (item.value / 8) * 100;
              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${barHeight}%`,
                          backgroundColor: item.completed ? '#7c3aed' : '#d1d5db',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.weekLabel}>{item.week}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 140,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    height: 120,
    paddingTop: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
    paddingLeft: 10,
    justifyContent: 'space-around',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: 40,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 40,
    borderRadius: 4,
    minHeight: 2,
  },
  weekLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
}); 