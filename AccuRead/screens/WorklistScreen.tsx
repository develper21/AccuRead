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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useWorklist } from '../hooks/useWorklist';
import { WorklistItem, WorklistFilters } from '../types';
import { Theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type WorklistNavigationProp = StackNavigationProp<any>;

const WorklistScreen: React.FC = () => {
  const navigation = useNavigation<WorklistNavigationProp>();
  const {
    worklist,
    loading,
    error,
    routeOptimization,
    stats,
    refreshWorklist,
    updateItemStatus,
    optimizeRoute,
    filterWorklist,
    clearFilters,
  } = useWorklist();

  const [selectedFilters, setSelectedFilters] = useState<WorklistFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleMeterPress = (item: WorklistItem) => {
    if (item.status === 'COMPLETED') {
      Alert.alert('Meter Already Read', 'This meter has already been read today.');
      return;
    }

    Alert.alert(
      'Start Reading',
      `Start reading meter for ${item.meter.consumerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            // Update status to IN_PROGRESS
            updateItemStatus(item.id, 'IN_PROGRESS');
            // Navigate to camera screen with meter data
            navigation.navigate('index', { meterData: item.meter });
          },
        },
      ]
    );
  };

  const handleSkipMeter = (item: WorklistItem) => {
    Alert.alert(
      'Skip Meter',
      `Skip reading meter for ${item.meter.consumerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => updateItemStatus(item.id, 'SKIPPED', 'Skipped by field agent'),
        },
      ]
    );
  };

  const handleMarkComplete = (item: WorklistItem) => {
    Alert.alert(
      'Mark Complete',
      `Mark meter for ${item.meter.consumerName} as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => updateItemStatus(item.id, 'COMPLETED', 'Completed manually'),
        },
      ]
    );
  };

  const applyFilters = (filters: WorklistFilters) => {
    setSelectedFilters(filters);
    filterWorklist(filters);
    setShowFilters(false);
  };

  const getStatusColor = (status: WorklistItem['status']) => {
    switch (status) {
      case 'PENDING': return Theme.colors.textSecondary;
      case 'IN_PROGRESS': return Theme.colors.warning;
      case 'COMPLETED': return Theme.colors.success;
      case 'SKIPPED': return Theme.colors.error;
      default: return Theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return Theme.colors.error;
      case 'MEDIUM': return Theme.colors.warning;
      case 'LOW': return Theme.colors.success;
      default: return Theme.colors.textSecondary;
    }
  };

  const renderWorklistItem = ({ item }: { item: WorklistItem }) => (
    <View style={[styles.worklistItem, item.status === 'COMPLETED' && styles.completedItem]}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.consumerName}>{item.meter.consumerName}</Text>
          <Text style={styles.address}>{item.meter.address}</Text>
          <View style={styles.itemMeta}>
            <Text style={[styles.priority, { color: getPriorityColor(item.meter.priority) }]}>
              {item.meter.priority}
            </Text>
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="location" size={16} color={Theme.colors.primary} />
          <Text style={styles.distance}>{Math.round(item.distance)}m</Text>
          <Text style={styles.estimatedTime}>{item.estimatedTime}min</Text>
        </View>
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.meterInfo}>Meter: {item.meter.meterNumber}</Text>
        <Text style={styles.consumerInfo}>Consumer: {item.meter.consumerNumber}</Text>
        <Text style={styles.dueInfo}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>

      <View style={styles.itemActions}>
        {item.status === 'PENDING' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleMeterPress(item)}
            >
              <Ionicons name="camera" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Start Reading</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleSkipMeter(item)}
            >
              <Ionicons name="arrow-forward" size={16} color={Theme.colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: Theme.colors.textSecondary }]}>Skip</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'IN_PROGRESS' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.successButton]}
            onPress={() => handleMarkComplete(item)}
          >
            <Ionicons name="checkmark" size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'COMPLETED' && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Theme.colors.success} />
            <Text style={[styles.actionButtonText, { color: Theme.colors.success }]}>Completed</Text>
          </View>
        )}
        
        {item.status === 'SKIPPED' && (
          <View style={styles.skippedBadge}>
            <Ionicons name="alert-circle" size={16} color={Theme.colors.error} />
            <Text style={[styles.actionButtonText, { color: Theme.colors.error }]}>Skipped</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filterTitle}>Filter by Status:</Text>
      <View style={styles.filterButtons}>
        {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedFilters.status?.includes(status as any) && styles.activeFilter
            ]}
            onPress={() => {
              const currentStatuses = selectedFilters.status || [];
              const newStatuses = currentStatuses.includes(status as any)
                ? currentStatuses.filter(s => s !== status)
                : [...currentStatuses, status as any];
              applyFilters({ ...selectedFilters, status: newStatuses });
            }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilters.status?.includes(status as any) && styles.activeFilterText
            ]}>
              {status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && worklist.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading nearby meters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today's Worklist</Text>
          <Text style={styles.subtitle}>
            {stats.pending} pending • {stats.completed} completed
          </Text>
        </View>
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="filter" size={24} color={Theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Route Optimization Info */}
      {routeOptimization && (
        <View style={styles.routeInfo}>
          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Ionicons name="map" size={16} color={Theme.colors.primary} />
              <Text style={styles.routeStatText}>
                {Math.round(routeOptimization.totalDistance)}m total
              </Text>
            </View>
            <View style={styles.routeStat}>
              <Ionicons name="time" size={16} color={Theme.colors.primary} />
              <Text style={styles.routeStatText}>
                {routeOptimization.estimatedTime}min estimated
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.optimizeButton} onPress={optimizeRoute}>
            <Ionicons name="refresh" size={16} color="#FFF" />
            <Text style={styles.optimizeButtonText}>Optimize Route</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters */}
      {showFilters && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {renderFilters()}
        </ScrollView>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color={Theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshWorklist}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Worklist */}
      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={worklist}
          renderItem={renderWorklistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshWorklist} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="list" size={48} color={Theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No meters found nearby</Text>
              <Text style={styles.emptySubtext}>Try refreshing or check your location</Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  filterToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  routeStats: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  routeStatText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
  },
  optimizeButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersContainer: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  activeFilter: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  activeFilterText: {
    color: '#FFF',
  },
  clearFiltersButton: {
    marginTop: Theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  clearFiltersText: {
    color: Theme.colors.primary,
    fontSize: 12,
  },
  errorContainer: {
    margin: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    color: Theme.colors.error,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    backgroundColor: Theme.colors.error,
    borderRadius: Theme.borderRadius.sm,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersScrollView: {
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  filtersScrollContent: {
    paddingHorizontal: Theme.spacing.md,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  listContainer: {
    padding: Theme.spacing.md,
  },
  worklistItem: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  completedItem: {
    opacity: 0.7,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  consumerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  priority: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary,
  },
  estimatedTime: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  itemDetails: {
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  meterInfo: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  consumerInfo: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginBottom: 2,
  },
  dueInfo: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  successButton: {
    backgroundColor: Theme.colors.success,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  skippedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    gap: Theme.spacing.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
});

export default WorklistScreen;
