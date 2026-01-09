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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { storageService } from '../services/storage';
import { exportService, ExportOptions } from '../services/exportService';
import { MeterReadingResult } from '../types';
import { Theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ExportScreen: React.FC = () => {
  const [readings, setReadings] = useState<MeterReadingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('csv');
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'serial' | 'confidence'>('date');

  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    setLoading(true);
    try {
      const allReadings = await storageService.getAllReadings();
      setReadings(allReadings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load readings');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredReadingsCount = () => {
    if (!dateRange) return readings.length;

    return readings.filter(reading => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= dateRange.start && readingDate <= dateRange.end;
    }).length;
  };

  const handleExport = async () => {
    if (readings.length === 0) {
      Alert.alert('No Data', 'No readings available to export');
      return;
    }

    setExporting(true);
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        dateRange: dateRange || undefined,
        sortBy,
        includeImages: false,
      };

      if (Platform.OS === 'ios') {
        // iOS: Use share sheet for better UX
        const filePath = await exportService.exportToCSV(readings, options);
        if (filePath) {
          Alert.alert('Success', 'Data exported successfully');
        }
      } else if (Platform.OS === 'android') {
        // Android: Direct file download
        const filePath = await exportService.exportToExcel(readings, options);
        if (filePath) {
          Alert.alert('Success', 'Data exported to Downloads');
        }
      } else {
        // Web: Direct download
        const filePath = await exportService.exportToCSV(readings, options);
        if (filePath) {
          Alert.alert('Success', 'Data exported successfully');
        }
      }
    } catch (error: any) {
      Alert.alert('Export Failed', error.message);
    } finally {
      setExporting(false);
    }
  };

  const formats = exportService.getAvailableFormats();
  const sortOptions = [
    { value: 'date', label: 'Date (Newest First)' },
    { value: 'serial', label: 'Meter Serial Number' },
    { value: 'confidence', label: 'Confidence Score' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading readings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={['#1E3A8A', '#111827']}
          style={styles.header}
        >
          <Text style={styles.title}>Data Export</Text>
          <Text style={styles.subtitle}>Securely export meter diagnostics</Text>
        </LinearGradient>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="stats-chart" size={24} color={Theme.colors.primary} />
            <Text style={styles.summaryTitle}>Analytics Summary</Text>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{readings.length}</Text>
              <Text style={styles.summaryLabel}>Total Readings</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{getFilteredReadingsCount()}</Text>
              <Text style={styles.summaryLabel}>Matched Filter</Text>
            </View>
          </View>
          {dateRange && (
            <View style={styles.dateRangeBadge}>
              <Ionicons name="calendar-outline" size={16} color={Theme.colors.primary} />
              <Text style={styles.dateRangeText}>
                {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
              </Text>
            </View>
          )}
          {dateRange && (
            <TouchableOpacity onPress={() => setDateRange(null)}>
              <Ionicons name="close-circle-outline" size={18} color={Theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Format Selection */}
        <View style={styles.partition}>
          <Text style={styles.partitionTitle}>Choose format</Text>
          <View style={styles.formatsContainer}>
            {formats.map((format) => (
              <TouchableOpacity
                key={format.value}
                style={[
                  styles.formatCard,
                  selectedFormat === format.value && styles.formatCardSelected,
                ]}
                onPress={() => setSelectedFormat(format.value as any)}
              >
                <View style={[styles.formatIcon, selectedFormat === format.value && styles.formatIconSelected]}>
                  <Ionicons
                    name={format.value === 'pdf' ? 'document-text' : format.value === 'excel' ? 'grid' : 'list'}
                    size={24}
                    color={selectedFormat === format.value ? '#FFF' : Theme.colors.primary}
                  />
                </View>
                <Text style={styles.formatLabel}>{format.label.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.partition}>
          <Text style={styles.partitionTitle}>Organization</Text>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.sortOptionSelected,
              ]}
              onPress={() => setSortBy(option.value as any)}
            >
              <Text style={[styles.sortLabel, sortBy === option.value && styles.sortLabelSelected]}>
                {option.label}
              </Text>
              {sortBy === option.value && <Ionicons name="checkmark-circle" size={20} color={Theme.colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.mainButton,
            (exporting || getFilteredReadingsCount() === 0) && styles.mainButtonDisabled,
          ]}
          onPress={handleExport}
          disabled={exporting || getFilteredReadingsCount() === 0}
        >
          {exporting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.mainButtonText}>Initialize Secure Export</Text>
              <Ionicons name="cloud-download-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Simplified Date Range Modal */}
      <Modal
        visible={showDateRangeModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Filter by Date</Text>
            <Text style={styles.modalDesc}>Date picker integration would go here. For now, using all data.</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowDateRangeModal(false)}
            >
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1E',
  },
  loadingText: {
    marginTop: 16,
    color: '#9CA3AF',
  },
  header: {
    padding: 32,
    paddingTop: 48,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#1F2937',
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3B82F6',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  dateRangeText: {
    color: '#3B82F6',
    marginHorizontal: 8,
    flex: 1,
  },
  partition: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  partitionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  formatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formatCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  formatIconSelected: {
    backgroundColor: '#3B82F6',
  },
  formatLabel: {
    color: '#FFF',
    fontWeight: '600',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sortOptionSelected: {
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  sortLabel: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  sortLabelSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  mainButton: {
    backgroundColor: '#3B82F6',
    margin: 24,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  mainButtonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#1F2937',
    width: '80%',
    padding: 32,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 12,
  },
  modalDesc: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalClose: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

export default ExportScreen;
