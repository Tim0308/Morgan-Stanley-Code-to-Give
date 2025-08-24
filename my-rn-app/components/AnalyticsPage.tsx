import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Line, Text as SvgText } from 'react-native-svg';
import { useTranslation } from '../contexts/TranslationContext';

const COLORS = {
  primary: "#006e34",
  secondary: "#A6B84E",
  accent: "#C83E0A",
  light: "#F4F4F9",
  textDark: "#222",
  textLight: "#fff",
  border: "#e5e7eb",
  inputBg: "#F4F4F9",
};

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const renderDistributionChart = (score: number, color: string, subject: string) => {
    const width = 300;
    const height = 180;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Bell curve parameters
    const mean = 75; // Center of the bell curve
    const stdDev = 15; // Standard deviation
    const minX = 40;
    const maxX = 100;
    
    // Create bell curve path
    const createBellCurve = () => {
      let path = '';
      const points = [];
      
      for (let x = minX; x <= maxX; x += 0.5) {
        const normalizedX = (x - mean) / stdDev;
        const y = Math.exp(-0.5 * normalizedX * normalizedX);
        const screenX = padding + ((x - minX) / (maxX - minX)) * chartWidth;
        const screenY = padding + chartHeight - (y * chartHeight * 0.8);
        points.push({ x: screenX, y: screenY });
      }
      
      // Start path
      path = `M ${points[0].x} ${padding + chartHeight}`;
      
      // Add curve points
      points.forEach((point, index) => {
        if (index === 0) {
          path += ` L ${point.x} ${point.y}`;
        } else {
          path += ` L ${point.x} ${point.y}`;
        }
      });
      
      // Close path to bottom
      path += ` L ${points[points.length - 1].x} ${padding + chartHeight} Z`;
      
      return path;
    };

    const scoreX = padding + ((score - minX) / (maxX - minX)) * chartWidth;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{subject} {t.performance}</Text>
        <Text style={styles.positionText}>{t.yourChildPosition}: {score}/100</Text>
        
        <Svg width={width} height={height} style={styles.chart}>
          {/* Grid lines - vertical */}
          {[40, 50, 60, 70, 80, 90, 100].map((value) => {
            const x = padding + ((value - minX) / (maxX - minX)) * chartWidth;
            return (
              <Line
                key={`v-${value}`}
                x1={x}
                y1={padding}
                x2={x}
                y2={padding + chartHeight}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
                strokeWidth={1}
              />
            );
          })}
          
          {/* Grid lines - horizontal */}
          {[0, 3, 6, 9, 12].map((value) => {
            const y = padding + chartHeight - (value / 12) * chartHeight;
            return (
              <Line
                key={`h-${value}`}
                x1={padding}
                y1={y}
                x2={padding + chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
                strokeWidth={1}
              />
            );
          })}
          
          {/* Bell curve */}
          <Path d={createBellCurve()} fill={color} opacity={0.4} />
          
          {/* Score line */}
          <Line
            x1={scoreX}
            y1={padding}
            x2={scoreX}
            y2={padding + chartHeight}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4,2"
          />
          
          {/* X-axis labels */}
          {[40, 50, 60, 70, 80, 90, 100].map((value) => {
            const x = padding + ((value - minX) / (maxX - minX)) * chartWidth;
            return (
              <SvgText
                key={`x-${value}`}
                x={x}
                y={height - 10}
                fontSize="10"
                fill="#666"
                textAnchor="middle"
              >
                {value}
              </SvgText>
            );
          })}
          
          {/* Y-axis labels */}
          {[0, 3, 6, 9, 12].map((value) => {
            const y = padding + chartHeight - (value / 12) * chartHeight;
            return (
              <SvgText
                key={`y-${value}`}
                x={25}
                y={y + 3}
                fontSize="10"
                fill="#666"
                textAnchor="middle"
              >
                {value}
              </SvgText>
            );
          })}
        </Svg>
        
        <View style={styles.scoreIndicator}>
          <View style={styles.scoreDot} />
          <Text style={styles.scoreText}>{t.yourChildScore}: {score})</Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('..\\assets\\backdrop.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>{t.gradeAnalytics}</Text>
          <Ionicons name="trending-up" size={24} color={COLORS.secondary} />
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsCard}>
          <View style={styles.metricsHeader}>
            <Ionicons name="pulse" size={20} color={COLORS.primary} />
            <Text style={styles.metricsTitle}>{t.performanceMetrics}</Text>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: COLORS.primary }]}>45</Text>
              <Text style={styles.metricLabel}>{t.readingSpeed}</Text>
              <Text style={styles.metricUnit}>{t.wpm}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: COLORS.secondary }]}>87%</Text>
              <Text style={styles.metricLabel}>{t.comprehensionAccuracy}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: COLORS.accent }]}>8.5h</Text>
              <Text style={styles.metricLabel}>{t.weeklyEngagementTime}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: COLORS.accent }]}>23%</Text>
              <Text style={styles.metricLabel}>{t.skillProgression}</Text>
            </View>
          </View>
        </View>

        {/* SuperAPP Progress */}
        <View style={styles.superappCard}>
          <View style={styles.superappHeader}>
            <Ionicons name="apps" size={20} color={COLORS.primary} />
            <Text style={styles.superappTitle}>{t.superAppProgress}</Text>
          </View>
          
          <View style={styles.connectionStatus}>
            <View style={styles.connectedIndicator}>
              <View style={styles.greenDot} />
              <Text style={styles.connectedText}>{t.connected}</Text>
            </View>
            <View style={styles.pointsContainer}>
              <Ionicons name="star" size={16} color={COLORS.accent} />
              <Text style={styles.pointsText}>2847</Text>
            </View>
          </View>
          
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>{t.mathProgress}</Text>
              <Text style={styles.progressLevel}>Level 5</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%', backgroundColor: COLORS.primary }]} />
              </View>
            </View>
            
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>{t.scienceProgress}</Text>
              <Text style={styles.progressLevel}>Level 3</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '45%', backgroundColor: COLORS.secondary }]} />
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.openButton}>
            <Ionicons name="open-outline" size={16} color={COLORS.primary} />
            <Text style={styles.openButtonText}>{t.openSuperapp}</Text>
          </TouchableOpacity>
        </View>

        {/* Reading Performance Chart */}
        {renderDistributionChart(85, COLORS.accent, t.reading)}

        {/* Writing Performance Chart */}
        {renderDistributionChart(82, COLORS.secondary, t.writing)}

        <View style={styles.spacer} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(244,244,249,0.93)', // COLORS.light with opacity for readability
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricsCard: {
    backgroundColor: COLORS.light,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 16,
  },
  metricUnit: {
    fontSize: 12,
    color: COLORS.textDark,
    marginTop: 2,
  },
  superappCard: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  superappHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  superappTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginRight: 6,
  },
  connectedText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressItem: {
    width: '48%',
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressLevel: {
    fontSize: 12,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  openButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 6,
  },
  chartContainer: {
    backgroundColor: COLORS.light,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  positionText: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 16,
  },
  chart: {
    marginBottom: 12,
    alignSelf: 'center',
  },
  scoreIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  scoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  spacer: {
    height: 20,
  },
});