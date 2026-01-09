/**
 * Copyright (c) 2025 develper21
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * 
 * IMPORTANT: Removal of this header violates the license terms.
 * This code remains the property of develper21 and is protected
 * under intellectual property laws.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { MeterReadingResult } from '../types';
import { useMeterReadings } from '../hooks';
import { Theme } from '../utils/theme';

const HistoryScreen: React.FC = () => {
  const { readings, loading, error, loadReadings, clearAllReadings } = useMeterReadings();

  useEffect(() => {
    loadReadings();
  }, [loadReadings]);

  const renderReadingItem = ({ item }: { item: MeterReadingResult }) => (
    <View style={styles.readingItem}>
      <View style={styles.readingHeader}>
        <View>
          <Text style={styles.readingDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.readingTime}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.miniBadge, { backgroundColor: item.isOffline ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <Text style={[styles.miniBadgeText, { color: item.isOffline ? '#60A5FA' : '#10B981' }]}>
              {item.isOffline ? 'EDGE' : 'CLOUD'}
            </Text>
          </View>
          {item.requiresReview && (
            <View style={[styles.miniBadge, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
              <Text style={[styles.miniBadgeText, { color: '#F97316' }]}>HITL</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.readingData}>
        {Object.entries(item.data).map(([key, value]) => (
          <Text key={key} style={styles.readingField}>
            <Text style={styles.fieldLabel}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}: </Text>
            {value}
          </Text>
        ))}
      </View>

      <View style={styles.itemFooter}>
        {item.location && (
          <Text style={styles.locationText}>
            📍 {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
          </Text>
        )}
        <Text style={styles.tenantLabel}>{item.tenantId?.toUpperCase()}</Text>
      </View>
    </View>
  );

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all meter reading history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllReadings();
            if (success) {
              Alert.alert('Success', 'All history cleared');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReadings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {readings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meter readings yet</Text>
          <Text style={styles.emptySubtext}>Start capturing readings to see them here</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Reading History</Text>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={readings}
            renderItem={renderReadingItem}
            keyExtractor={(item) => item.timestamp}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  clearButton: {
    backgroundColor: Theme.colors.error,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  clearButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: Theme.spacing.md,
  },
  readingItem: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  readingDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  readingTime: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  readingData: {
    marginBottom: Theme.spacing.sm,
  },
  readingField: {
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 4,
  },
  fieldLabel: {
    color: Theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  locationText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  tenantLabel: {
    fontSize: 10,
    color: Theme.colors.primary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.text,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: Theme.colors.error,
    textAlign: 'center',
    marginTop: Theme.spacing.xl,
  },
  retryButton: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'center',
    marginTop: Theme.spacing.md,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
