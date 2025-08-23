import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, TokenBalance, ShopItem, TokenTransaction, UserProfile } from '../lib/api';

export default function TokensPage() {
  const [selectedTab, setSelectedTab] = useState('Shop');
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [tokenHistory, setTokenHistory] = useState<TokenTransaction[]>([]);
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

      // Get user profile to get children
      const userProfile: UserProfile = await api.getUserProfile();
      
      if (!userProfile.children || userProfile.children.length === 0) {
        // No children found, show empty state
        setTokenBalance({ balance: 0, weekly_earned: 0, total_earned: 0 });
        setShopItems([]);
        setTokenHistory([]);
        setLoading(false);
        return;
      }

      // Use first child for now
      const firstChild = userProfile.children[0];
      setSelectedChildId(firstChild.id);

      // Load token data
      const [balance, items, history] = await Promise.all([
        api.getTokenBalance(firstChild.id),
        api.getShopItems(),
        api.getTokenHistory(firstChild.id)
      ]);

      setTokenBalance(balance);
      setShopItems(items);
      setTokenHistory(history);

    } catch (err) {
      console.error('Error loading token data:', err);
      setError('Failed to load token data');
      // Show empty state on error
      setTokenBalance({ balance: 0, weekly_earned: 0, total_earned: 0 });
      setShopItems([]);
      setTokenHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Tokens</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading tokens...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Tokens</Text>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Tokens</Text>
      
      {/* Token Balance Section */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="diamond" size={32} color="#fbbf24" />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceAmount}>{tokenBalance?.balance || 0}</Text>
            <Text style={styles.balanceLabel}>Current Balance</Text>
          </View>
          <View style={styles.weeklyEarned}>
            <Text style={styles.weeklyAmount}>+{tokenBalance?.weekly_earned || 0}</Text>
            <Text style={styles.weeklyLabel}>This Week</Text>
          </View>
        </View>
        
        <View style={styles.totalEarned}>
          <Text style={styles.totalLabel}>Total Earned: {tokenBalance?.total_earned || 0} tokens</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'Shop' && styles.selectedTab]}
          onPress={() => setSelectedTab('Shop')}
        >
          <Text style={[styles.tabText, selectedTab === 'Shop' && styles.selectedTabText]}>
            Shop
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'History' && styles.selectedTab]}
          onPress={() => setSelectedTab('History')}
        >
          <Text style={[styles.tabText, selectedTab === 'History' && styles.selectedTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on selected tab */}
      {selectedTab === 'Shop' ? (
        <View style={styles.shopSection}>
          {shopItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No items available</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new rewards!</Text>
            </View>
          ) : (
            <View style={styles.shopGrid}>
              {shopItems.map((item) => (
                <View key={item.id} style={styles.shopItem}>
                  <View style={styles.itemIcon}>
                    {item.emoji ? (
                      <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    ) : (
                      <Ionicons name={item.icon as any || 'gift-outline'} size={24} color="#8b5cf6" />
                    )}
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                  <View style={styles.itemFooter}>
                    <View style={styles.itemCost}>
                      <Ionicons name="diamond" size={16} color="#fbbf24" />
                      <Text style={styles.itemCostText}>{item.cost}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.buyButton,
                        (tokenBalance?.balance || 0) < item.cost && styles.buyButtonDisabled
                      ]}
                      disabled={(tokenBalance?.balance || 0) < item.cost}
                    >
                      <Text style={[
                        styles.buyButtonText,
                        (tokenBalance?.balance || 0) < item.cost && styles.buyButtonTextDisabled
                      ]}>
                        {(tokenBalance?.balance || 0) < item.cost ? 'Need More' : 'Buy'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.historySection}>
          {tokenHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No transaction history</Text>
              <Text style={styles.emptyStateSubtext}>Start earning tokens by completing activities!</Text>
            </View>
          ) : (
            tokenHistory.map((transaction) => (
              <View key={transaction.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons
                    name={transaction.type === 'earned' ? 'add-circle' : transaction.type === 'spent' ? 'remove-circle' : 'gift'}
                    size={24}
                    color={transaction.type === 'earned' ? '#22c55e' : transaction.type === 'spent' ? '#ef4444' : '#8b5cf6'}
                  />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyDescription}>{transaction.description}</Text>
                  <Text style={styles.historyTime}>{formatTimeAgo(transaction.created_at)}</Text>
                </View>
                <Text style={[
                  styles.historyAmount,
                  { color: transaction.type === 'earned' ? '#22c55e' : '#ef4444' }
                ]}>
                  {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  weeklyEarned: {
    alignItems: 'flex-end',
  },
  weeklyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  weeklyLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalEarned: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  selectedTabText: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  shopSection: {
    marginBottom: 20,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCostText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  buyButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  buyButtonTextDisabled: {
    color: '#9ca3af',
  },
  historySection: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  historyIcon: {
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
}); 