import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VocabVentureGame from './VocabVentureGame';
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

export default function GamesPage() {
  const { t } = useTranslation();
  const [showVocabVenture, setShowVocabVenture] = useState(false);

  const handleGameComplete = (result: any) => {
    console.log('Game completed:', result);
    // Handle game completion - award tokens, update progress, etc.
  };

  return (
    <ImageBackground
      source={require('../assets/backdrop.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>{t.games}</Text>
          <Ionicons name="game-controller" size={24} color={COLORS.secondary} />
        </View>

        {/* Weekly Challenge */}
        <View style={styles.weeklyChallenge}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>{t.weeklyChallenge}</Text>
            <View style={styles.completedGames}>
              <Text style={styles.completedNumber}>5</Text>
              <Text style={styles.completedText}>{t.gamesCompleted}</Text>
            </View>
          </View>

          <View style={styles.challengeCard}>
            <View style={styles.challengeCardHeader}>
              <Text style={styles.challengeName}>VocabVenture</Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>Outdoors</Text>
              </View>
            </View>


            <Text style={styles.challengeDescription}>
              Read together for 30 minutes every day this week.{'\n'}
              Parent and child take turns reading paragraphs.
            </Text>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>{t.progress}</Text>
              <Text style={styles.progressText}>4/7 {t.days}</Text>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '57%' }]} />
            </View>

            <View style={styles.challengeFooter}>
              <View style={styles.challengeStats}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color={COLORS.primary} />
                  <Text style={styles.statText}>23 players completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color={COLORS.primary} />
                  <Text style={styles.statText}>3 days left</Text>
                </View>

              </View>
              
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => setShowVocabVenture(true)}
              >
                <Ionicons name="play" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Extra Games */}
        <View style={styles.extraGames}>
          <Text style={styles.sectionTitle}>{t.extraGames}</Text>

          <View style={styles.gameCard}>
            <View style={styles.gameIcon}>
              <Ionicons name="search" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>Word Detective</Text>
              <Text style={styles.gameDescription}>
                Find hidden words in picture scenes together
              </Text>
              <View style={styles.gameTime}>
                <Ionicons name="time" size={14} color={COLORS.primary} />
                <Text style={styles.timeText}>10 mins</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.gamePlayButton}>
              <Ionicons name="play" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
          <View style={styles.gameCard}>
            <View style={styles.gameIcon}>
              <Text style={styles.gameEmoji}>🏃‍♂️</Text>
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>Alphabet Race</Text>
              <Text style={styles.gameDescription}>
                Race to find objects starting with each letter
              </Text>
              <View style={styles.gameTime}>
                <Ionicons name="time" size={14} color={COLORS.primary} />
                <Text style={styles.timeText}>15 mins</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.gamePlayButton}>
              <Ionicons name="play" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        </View>


        <View style={styles.spacer} />
        
        {/* VocabVenture Game Modal */}
        {showVocabVenture && (
          <VocabVentureGame
            onClose={() => setShowVocabVenture(false)}
            onGameComplete={handleGameComplete}
          />
        )}
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
  weeklyChallenge: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  completedGames: {
    alignItems: 'flex-end',
  },
  completedNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.textDark,
  },
  challengeCard: {
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  challengeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  difficultyBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  challengeDescription: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textDark,
    marginLeft: 4,
  },
  playButton: {
    backgroundColor: COLORS.accent,
    width: 37,
    height: 37,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraGames: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gameEmoji: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 8,
  },
  gameTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textDark,
    marginLeft: 4,
  },
  gamePlayButton: {
    backgroundColor: COLORS.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  spacer: {
    height: 20,
  },
  tokenReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tokenText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B8860B',
    marginLeft: 2,
  },
  gameNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
}); 
