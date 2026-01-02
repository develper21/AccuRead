import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  DatePickerAndroid,
  DatePickerIOS,
  Platform,
  Modal,
} from 'react-native';
import { storageService } from '../services/storage';
import { exportService, ExportOptions } from '../services/exportService';
import { MeterReadingResult } from '../types';
import { Theme } from '../utils/theme';

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

      let filePath: string;
      
      switch (selectedFormat) {
        case 'csv':
          filePath = await exportService.exportToCSV(readings, options);
          break;
        case 'excel':
          filePath = await exportService.exportToExcel(readings, options);
          break;
        case 'pdf':
          filePath = await exportService.generatePDFReport(readings, options);
          break;
        default:
          throw new Error('Unsupported format');
      }

      await exportService.shareFile(filePath, selectedFormat);
      
      Alert.alert(
        'Success',
        `Export completed successfully! File shared via ${selectedFormat.toUpperCase()} format.`
      );
    } catch (error: any) {
      Alert.alert('Export Failed', error.message);
    } finally {
      setExporting(false);
    }
  };

  const showDatePicker = async (isStartDate: boolean) => {
    if (Platform.OS === 'android') {
      try {
        const { action, year, month, day } = await DatePickerAndroid.open({
          date: isStartDate ? (dateRange?.start || new Date()) : (dateRange?.end || new Date()),
          mode: 'default',
        });

        if (action === DatePickerAndroid.dateSetAction) {
          const selectedDate = new Date(year, month, day);
          setDateRange(prev => ({
            start: isStartDate ? selectedDate : prev?.start || new Date(),
            end: !isStartDate ? selectedDate : prev?.end || new Date(),
          }));
        }
      } catch (error) {
        console.warn('Date picker error:', error);
      }
    } else {
      setShowDateRangeModal(true);
    }
  };

  const clearDateRange = () => {
    setDateRange(null);
  };

  const getFilteredReadingsCount = () => {
    if (!dateRange) return readings.length;
    
    return readings.filter(reading => {
      const readingDate = new Date(reading.timestamp);
      return readingDate >= dateRange.start && readingDate <= dateRange.end;
    }).length;
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Data</Text>
        <Text style={styles.subtitle}>Export your meter readings</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Export Summary</Text>
        <Text style={styles.summaryText}>
          Total Readings: {readings.length}
        </Text>
        <Text style={styles.summaryText}>
          To Export: {getFilteredReadingsCount()}
        </Text>
        {dateRange && (
          <Text style={styles.summaryText}>
            Date Range: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Format Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Format</Text>
        {formats.map((format) => (
          <TouchableOpacity
            key={format.value}
            style={[
              styles.optionCard,
              selectedFormat === format.value && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedFormat(format.value as any)}
          >
            <View style={styles.optionHeader}>
              <Text style={[
                styles.optionTitle,
                selectedFormat === format.value && styles.optionTitleSelected,
              ]}>
                {format.label}
              </Text>
              {selectedFormat === format.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.optionDescription}>{format.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Range Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Date Range (Optional)</Text>
          {dateRange && (
            <TouchableOpacity onPress={clearDateRange}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.dateRangeCard}
          onPress={() => setShowDateRangeModal(true)}
        >
          <Text style={styles.dateRangeTitle}>
            {dateRange 
              ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
              : 'All Dates'
            }
          </Text>
          <Text style={styles.dateRangeSubtitle}>
            Tap to select date range
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              sortBy === option.value && styles.optionCardSelected,
            ]}
            onPress={() => setSortBy(option.value as any)}
          >
            <View style={styles.optionHeader}>
              <Text style={[
                styles.optionTitle,
                sortBy === option.value && styles.optionTitleSelected,
              ]}>
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Export Button */}
      <TouchableOpacity
        style={[
          styles.exportButton,
          (exporting || getFilteredReadingsCount() === 0) && styles.exportButtonDisabled,
        ]}
        onPress={handleExport}
        disabled={exporting || getFilteredReadingsCount() === 0}
      >
        {exporting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.exportButtonText}>
            Export {selectedFormat.toUpperCase()} ({getFilteredReadingsCount()} readings)
          </Text>
        )}
      </TouchableOpacity>

      {/* Date Range Modal */}
      <Modal
        visible={showDateRangeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                Start Date: {dateRange?.start.toLocaleDateString() || 'Select Date'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => showDatePicker(false)}
            >
              <Text style={styles.dateButtonText}>
                End Date: {dateRange?.end.toLocaleDateString() || 'Select Date'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowDateRangeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => setShowDateRangeModal(false)}
              >
                <Text style={styles.modalButtonTextPrimary}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    marginTop: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  summaryText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  section: {
    margin: Theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  clearButton: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '500',
  },
  optionCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: `${Theme.colors.primary}10`,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  optionTitleSelected: {
    color: Theme.colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  checkmark: {
    fontSize: 18,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  dateRangeCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dateRangeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  dateRangeSubtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  exportButton: {
    backgroundColor: Theme.colors.primary,
    margin: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    backgroundColor: Theme.colors.textSecondary,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.xl,
    borderRadius: Theme.borderRadius.lg,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  dateButton: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  dateButtonText: {
    fontSize: 16,
    color: Theme.colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  modalButtonPrimary: {
    backgroundColor: Theme.colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    color: Theme.colors.text,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default ExportScreen;
