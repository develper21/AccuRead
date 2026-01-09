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

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MeterReadingResult } from '../types';
import { Theme } from '../utils/theme';

interface ResultCardProps {
  result: MeterReadingResult;
  onEdit: (field: keyof MeterReadingResult['data']) => void;
  onSubmit: () => void;
  onRetake: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onEdit,
  onSubmit,
  onRetake,
}) => {
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return Theme.colors.success;
    if (confidence >= 70) return Theme.colors.warning;
    return Theme.colors.error;
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 90) return 'High';
    if (confidence >= 70) return 'Medium';
    return 'Low';
  };

  const renderField = (
    label: string,
    value: string,
    field: keyof MeterReadingResult['data'],
    confidence: number,
  ) => (
    <TouchableOpacity
      style={styles.fieldContainer}
      onPress={() => onEdit(field)}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.confidenceContainer}>
          <View
            style={[
              styles.confidenceDot,
              { backgroundColor: getConfidenceColor(confidence) },
            ]}
          />
          <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence) }]}>
            {confidence.toFixed(0)}%
          </Text>
        </View>
      </View>
      <Text style={styles.fieldValue}>{value}</Text>
      <Text style={styles.confidenceLabel}>
        Confidence: {getConfidenceText(confidence)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Meter Reading Results</Text>
          <View style={[
            styles.aiBadge,
            { backgroundColor: result.isOffline ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)' }
          ]}>
            <Text style={[
              styles.aiBadgeText,
              { color: result.isOffline ? '#60A5FA' : '#10B981' }
            ]}>
              {result.isOffline ? 'EDGE AI' : 'CLOUD AI'}
            </Text>
          </View>
        </View>

        {/* Phase 2: Tenant & Sync Info */}
        <View style={styles.ph2HeaderRow}>
          <Text style={styles.tenantText}>Organization: {result.tenantId.toUpperCase()}</Text>
          <View style={[
            styles.syncBadge,
            { backgroundColor: result.isSynced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(249, 115, 22, 0.1)' }
          ]}>
            <Text style={[
              styles.syncBadgeText,
              { color: result.isSynced ? '#10B981' : '#F97316' }
            ]}>
              {result.isSynced ? 'Synced' : 'Pending Sync'}
            </Text>
          </View>
        </View>

        {/* HITL Warning Label */}
        {result.requiresReview && (
          <View style={styles.reviewBadge}>
            <Text style={styles.reviewBadgeText}>⚠️ PENDING SUPERVISOR REVIEW</Text>
          </View>
        )}

        {/* Image Preview */}
        <View style={styles.imagePreview}>
          <Text style={styles.imagePreviewText}>Captured Image</Text>
          {result.imageUrl ? (
            <Image source={{ uri: result.imageUrl }} style={styles.capturedImage} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        {/* Dynamic Fields based on Template/Data */}
        {Object.entries(result.data).map(([key, value]) => (
          <React.Fragment key={key}>
            {renderField(
              key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
              value,
              key as any,
              result.confidence[key as keyof typeof result.confidence] || 90
            )}
          </React.Fragment>
        ))}

        {/* Security Audit Section */}
        {result.securityStatus && (
          <View style={[
            styles.securityContainer,
            { borderColor: result.securityStatus.isTampered || !result.securityStatus.isLive ? Theme.colors.error : 'rgba(16, 185, 129, 0.3)' }
          ]}>
            <View style={styles.fieldHeader}>
              <Text style={styles.securityLabel}>SECURITY AUDIT</Text>
              <Text style={[
                styles.securityStatusText,
                { color: result.securityStatus.isTampered ? Theme.colors.error : Theme.colors.success }
              ]}>
                {result.securityStatus.isTampered ? 'TAMPER DETECTED' : 'SECURE'}
              </Text>
            </View>

            {result.securityStatus.isTampered && (
              <Text style={styles.tamperWarning}>{result.securityStatus.tamperReason}</Text>
            )}

            <View style={styles.livenessRow}>
              <Text style={styles.livenessText}>Liveness Score:</Text>
              <Text style={[
                styles.livenessValue,
                { color: result.securityStatus.isLive ? Theme.colors.success : Theme.colors.warning }
              ]}>
                {result.securityStatus.livenessConfidence.toFixed(1)}% {result.securityStatus.isLive ? '(Live)' : '(Suspected Photo/Screen)'}
              </Text>
            </View>
          </View>
        )}

        {/* Consumer Insights Section */}
        {result.analytics && (
          <View style={styles.analyticsContainer}>
            <Text style={styles.analyticsLabel}>CONSUMER INSIGHTS</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Usage (Units)</Text>
                <Text style={styles.statValue}>+{result.analytics.consumptionDelta.toFixed(1)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Est. Bill</Text>
                <Text style={styles.billValue}>₹ {result.analytics.estimatedBill.toFixed(2)}</Text>
              </View>
            </View>

            {result.analytics.alertMessage && (
              <View style={[
                styles.alertContainer,
                { backgroundColor: result.analytics.isAnomaly ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)' }
              ]}>
                <Text style={[
                  styles.alertText,
                  { color: result.analytics.isAnomaly ? Theme.colors.error : Theme.colors.secondary }
                ]}>
                  {result.analytics.alertMessage}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Location Info */}
        {result.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={styles.locationText}>
              Lat: {result.location.latitude.toFixed(6)}, Lng: {result.location.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Captured: {new Date(result.timestamp).toLocaleString()}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitButtonText}>
              {result.requiresReview ? 'Send for Review' : 'Save Reading'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    letterSpacing: -0.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  aiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  ph2HeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tenantText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reviewBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.warning,
    alignItems: 'center',
  },
  reviewBadgeText: {
    color: Theme.colors.warning,
    fontSize: 12,
    fontWeight: 'bold',
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  imagePreviewText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: Theme.spacing.sm,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: Theme.borderRadius.md,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.textSecondary,
    borderStyle: 'dashed',
  },
  fieldContainer: {
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  fieldLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fieldValue: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xs,
  },
  confidenceLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  locationContainer: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
  },
  locationLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.xs,
  },
  locationText: {
    color: Theme.colors.text,
    fontSize: 14,
  },
  timestamp: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
  securityContainer: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
  },
  securityLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  securityStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tamperWarning: {
    color: Theme.colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: Theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: Theme.spacing.sm,
    borderRadius: 8,
  },
  livenessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: Theme.spacing.sm,
  },
  livenessText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
  },
  livenessValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  analyticsContainer: {
    marginTop: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.3)',
  },
  analyticsLabel: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: Theme.spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  billValue: {
    color: Theme.colors.success,
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertContainer: {
    marginTop: Theme.spacing.sm,
    padding: Theme.spacing.sm,
    borderRadius: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xl,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
  },
  retakeButtonText: {
    color: Theme.colors.secondary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginLeft: Theme.spacing.sm,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ResultCard;
