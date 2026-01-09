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
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { storageService } from '../services/storage';
import { ManagerService } from '../services/managerService';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../contexts/I18nContext';
import { exportService } from '../services/exportService';
import { MeterReadingResult, ActivityLog } from '../types';
import { Theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface DashboardStats {
  totalReadings: number;
  edgeReadings: number;
  cloudReadings: number;
  pendingReview: number;
  tamperAlerts: number;
  averageConfidence: number;
}

const DashboardScreen: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [readings, setReadings] = useState<MeterReadingResult[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReadings: 0,
    edgeReadings: 0,
    cloudReadings: 0,
    pendingReview: 0,
    tamperAlerts: 0,
    averageConfidence: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  // Authentication and authorization guard
  React.useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        t('authentication_required'),
        t('please_sign_in_manager'),
        [{ text: t('ok') }]
      );
      return;
    }

    // Role-based access control
    const allowedRoles = ['ADMIN', 'SUPERVISOR'];
    if (!user?.role || !allowedRoles.includes(user.role)) {
      Alert.alert(
        t('access_denied'),
        `${t('manager_panel_restricted')} ${allowedRoles.join(' and ')} ${t('your_role')}: ${user?.role || 'UNKNOWN'}`,
        [{ text: t('ok') }]
      );
      return;
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [readingsData, logsData] = await Promise.all([
        storageService.getReadings(),
        storageService.getActivityLogs(),
      ]);
      
      // Filter readings by date range
      const filteredReadings = readingsData.filter(reading => {
        const readingDate = new Date(reading.timestamp);
        return readingDate >= dateRange.start && readingDate <= dateRange.end;
      });
      
      setReadings(filteredReadings);
      setLogs(logsData);
      
      const calculatedStats = ManagerService.calculateStats(filteredReadings);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getChartData = () => {
    const last7Days = readings.slice(-7);
    const labels = last7Days.map((_, index) => `Day ${index + 1}`);
    const data = last7Days.map(reading => parseFloat(reading.data.kwh) || 0);
    
    return { labels, data };
  };

  const getConsumptionData = () => {
    const serialCounts: { [key: string]: number } = {};
    readings.forEach(reading => {
      const serial = reading.data.serialNumber;
      serialCounts[serial] = (serialCounts[serial] || 0) + 1;
    });

    const topMeters = Object.entries(serialCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      labels: topMeters.map(([serial]) => serial.slice(-4)),
      data: topMeters.map(([, count]) => count),
    };
  };

  const updateDateRange = (days: number) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    setDateRange({ start, end });
  };

  const { labels, data } = getChartData();
  const consumptionData = getConsumptionData();

  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Export functionality
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const options = {
        format: exportFormat,
        dateRange,
        sortBy: 'date' as const,
      };

      let filePath: string;
      switch (exportFormat) {
        case 'csv':
          filePath = await exportService.exportToCSV(readings, options);
          break;
        case 'excel':
          filePath = await exportService.exportToExcel(readings, options);
          break;
        case 'pdf':
          filePath = await exportService.generatePDFReport(readings, options);
          break;
      }

      // Share the file
      await exportService.shareFile(filePath, exportFormat);
      
      Alert.alert(
        t('export_completed'),
        `${t('export_file_saved')}: ${filePath}`,
        [{ text: t('ok') }]
      );
    } catch (error: any) {
      Alert.alert(
        t('export_failed'),
        error.message || t('error'),
        [{ text: t('retry') }]
      );
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  const showExportOptions = () => {
    const formats = exportService.getAvailableFormats();
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        options: [
          ...formats.map(format => format.label),
          t('cancel'),
        ],
        cancelButtonIndex: formats.length,
      }, (buttonIndex) => {
        if (buttonIndex === formats.length) return;
        
        const selectedFormat = formats[buttonIndex].value as 'csv' | 'excel' | 'pdf';
        setExportFormat(selectedFormat);
        setShowExportModal(true);
      });
    } else {
      // For Android, show a simple modal
      setShowExportModal(true);
    }
  };

  const chartConfig = {
    backgroundColor: Theme.colors.background,
    backgroundGradientFrom: Theme.colors.background,
    backgroundGradientTo: Theme.colors.background,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: Theme.colors.primary,
    },
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('dashboard')}</Text>
          <Text style={styles.headerSubtitle}>{t('analytics')}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowExportModal(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.dateButtonText}>
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            disabled={exportLoading}
          >
            <Ionicons name="download-outline" size={20} color={Theme.colors.primary} />
            <Text style={styles.exportButtonText}>
              {exportLoading ? t('exporting') : t('export')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="camera" size={24} color={Theme.colors.primary} />
          <Text style={styles.statNumber}>{stats.totalReadings}</Text>
          <Text style={styles.statLabel}>{t('total_readings')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="eye" size={24} color={Theme.colors.warning} />
          <Text style={styles.statNumber}>{stats.pendingReview}</Text>
          <Text style={styles.statLabel}>{t('pending_review')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark" size={24} color={Theme.colors.success} />
          <Text style={styles.statNumber}>{stats.averageConfidence.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>{t('avg_confidence')}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('reading_trends')}</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('most_active_meter')}</Text>
        <BarChart
          data={{
            labels: consumptionData.labels,
            datasets: [{ data: consumptionData.data }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          yAxisLabel="Readings"
          yAxisSuffix=""
          style={styles.chart}
        />
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>{t('recent_activity')}</Text>
        {logs.slice(0, 5).map((log, index) => (
          <View key={index} style={styles.logItem}>
            <View style={styles.logIcon}>
              <Ionicons 
                name={log.type === 'warning' ? 'warning' : log.type === 'error' ? 'alert-circle' : 'checkmark-circle'} 
                size={16} 
                color={log.type === 'warning' ? Theme.colors.warning : log.type === 'error' ? Theme.colors.error : Theme.colors.success} 
              />
            </View>
            <View style={styles.logContent}>
              <Text style={styles.logMessage}>{log.message || log.action}</Text>
              <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('export_data')}</Text>
            
            <View style={styles.formatOptions}>
              {exportService.getAvailableFormats().map((format) => (
                <TouchableOpacity
                  key={format.value}
                  style={[
                    styles.formatOption,
                    exportFormat === format.value && styles.selectedFormat
                  ]}
                  onPress={() => setExportFormat(format.value as 'csv' | 'excel' | 'pdf')}
                >
                  <Text style={[
                    styles.formatText,
                    exportFormat === format.value && styles.selectedFormatText
                  ]}>
                    {format.label}
                  </Text>
                  <Text style={styles.formatDescription}>
                    {format.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.exportModalButton]}
                onPress={handleExport}
                disabled={exportLoading}
              >
                {exportLoading ? (
                  <Text style={styles.exportButtonText}>{t('loading')}</Text>
                ) : (
                  <Text style={styles.exportButtonText}>{t('export')}</Text>
                )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  exportButtonText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  dateButtonText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  logoutButton: {
    padding: Theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginTop: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  chartContainer: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  chart: {
    borderRadius: Theme.borderRadius.md,
  },
  logsContainer: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  logIcon: {
    marginRight: Theme.spacing.sm,
    marginTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 14,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  formatOptions: {
    marginBottom: Theme.spacing.lg,
  },
  formatOption: {
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.sm,
  },
  selectedFormat: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  formatText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  selectedFormatText: {
    color: Theme.colors.primary,
  },
  formatDescription: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cancelButtonText: {
    color: Theme.colors.text,
    fontWeight: '600',
  },
  exportModalButton: {
    backgroundColor: Theme.colors.primary,
  },
});

export default DashboardScreen;
