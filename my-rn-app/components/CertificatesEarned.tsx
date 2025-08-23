import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CertificatesEarned() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#f59e0b" />
        <Text style={styles.title}>Certificates Earned</Text>
      </View>
      
      <View style={styles.certificateCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="star-outline" size={20} color="#f59e0b" />
          <View style={styles.cardHeaderRight}>
            <Ionicons name="star-outline" size={20} color="#f59e0b" />
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.trophyContainer}>
            <Ionicons name="trophy" size={40} color="#f59e0b" />
          </View>
          
          <Text style={styles.certificateTitle}>Alphabet Master</Text>
          <Text style={styles.certificateSubtitle}>Certificate of Achievement</Text>
          
          <View style={styles.certificateFooter}>
            <Text style={styles.recipientName}>Emma Chen • 2025</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.loadMoreButton}>
        <Text style={styles.loadMoreText}>Load More (5 more)</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  certificateCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderRight: {
    // Empty for now, just for positioning
  },
  cardContent: {
    alignItems: 'center',
  },
  trophyContainer: {
    marginBottom: 12,
  },
  certificateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
    textAlign: 'center',
  },
  certificateSubtitle: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 16,
    textAlign: 'center',
  },
  certificateFooter: {
    alignItems: 'center',
  },
  recipientName: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  loadMoreButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
}); 