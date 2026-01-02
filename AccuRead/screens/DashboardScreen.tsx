import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { storageService } from '../services/storage';
import { MeterReadingResult } from '../types';
import { Theme } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

interface DashboardStats {
  totalReadings: number;
  thisMonth: number;
  averageConfidence: number;
  topMeterSerial: string;
}

const DashboardScreen: React.FC = () => {
  const [readings, setReadings] = useState<MeterReadingResult[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReadings: 0,
    thisMonth: 0,
    averageConfidence: 0,
    topMeterSerial: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const savedReadings = await storageService.getAllReadings();
      setReadings(savedReadings);
      calculateStats(savedReadings);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateStats = (allReadings: MeterReadingResult[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthReadings = allReadings.filter(reading => {
      const readingDate = new Date(reading.timestamp);
      return readingDate.getMonth() === thisMonth && readingDate.getFullYear() === thisYear;
    });

    const totalConfidence = allReadings.reduce((sum, reading) => {
      const avgConfidence = Object.values(reading.confidence).reduce((a, b) => a + b, 0) / Object.values(reading.confidence).length;
      return sum + avgConfidence;
    }, 0);

    const averageConfidence = allReadings.length > 0 ? totalConfidence / allReadings.length : 0;

    // Find most frequent meter serial
    const serialCounts: { [key: string]: number } = {};
    allReadings.forEach(reading => {
      const serial = reading.data.serialNumber;
      serialCounts[serial] = (serialCounts[serial] || 0) + 1;
    });

    const topMeterSerial = Object.entries(serialCounts).reduce((a, b) => 
      serialCounts[a[0]] > serialCounts[b[0]] ? a : b, ['', 0])[0];

    setStats({
      totalReadings: allReadings.length,
      thisMonth: thisMonthReadings.length,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      topMeterSerial,
    });
  };

  const getChartData = () => {
    const now = new Date();
    let days = 7;
    let dateFormat = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' });

    if (selectedPeriod === 'month') {
      days = 30;
      dateFormat = (date: Date) => date.getDate().toString();
    } else if (selectedPeriod === 'year') {
      days = 12;
      dateFormat = (date: Date) => date.toLocaleDateString('en-US', { month: 'short' });
    }

    const labels: string[] = [];
    const data: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (selectedPeriod === 'year') {
        date.setMonth(date.getMonth() - i);
      } else {
        date.setDate(date.getDate() - i);
      }
      
      labels.push(dateFormat(date));
      
      const dayReadings = readings.filter(reading => {
        const readingDate = new Date(reading.timestamp);
        if (selectedPeriod === 'year') {
          return readingDate.getMonth() === date.getMonth() && readingDate.getFullYear() === date.getFullYear();
        } else {
          return readingDate.toDateString() === date.toDateString();
        }
      });
      
      data.push(dayReadings.length);
    }

    return { labels, data };
  };

  const getConsumptionData = () => {
    const last7Readings = readings.slice(-7);
    const labels = last7Readings.map((_, index) => `Day ${index + 1}`);
    const kwhData = last7Readings.map(reading => parseFloat(reading.data.kwh) || 0);
    const kvahData = last7Readings.map(reading => parseFloat(reading.data.kvah) || 0);

    return {
      labels,
      datasets: [
        {
          data: kwhData,
          color: (opacity = 1) => `rgba(52, 211, 153, ${opacity})`,
        },
        {
          data: kvahData,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        },
      ],
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: Theme.colors.surface,
    backgroundGradientFrom: Theme.colors.surface,
    backgroundGradientTo: Theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: Theme.colors.primary,
    },
  };

  const { labels, data } = getChartData();
  const consumptionData = getConsumptionData();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Analytics & Insights</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalReadings}</Text>
          <Text style={styles.statLabel}>Total Readings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.averageConfidence}%</Text>
          <Text style={styles.statLabel}>Avg Confidence</Text>
        </View>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reading Trends Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Reading Trends</Text>
        {data.length > 0 ? (
          <LineChart
            data={{
              labels,
              datasets: [{
                data,
                color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                strokeWidth: 2,
              }],
            }}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No data available</Text>
          </View>
        )}
      </View>

      {/* Consumption Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Energy Consumption</Text>
        {consumptionData.labels.length > 0 ? (
          <BarChart
            data={consumptionData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No consumption data</Text>
          </View>
        )}
      </View>

      {/* Top Meter Info */}
      {stats.topMeterSerial && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Most Active Meter</Text>
          <Text style={styles.infoValue}>{stats.topMeterSerial}</Text>
          <Text style={styles.infoSubtitle}>Highest reading frequency</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: Theme.spacing.xs,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFF',
  },
  chartContainer: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  chart: {
    marginVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  infoTitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  infoSubtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
});

export default DashboardScreen;
