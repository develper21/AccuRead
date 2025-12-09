import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Image} from 'react-native';
import {MeterReadingResult, ConfidenceScores} from '../types';
import {Theme} from '../utils/theme';

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
              {backgroundColor: getConfidenceColor(confidence)},
            ]}
          />
          <Text style={[styles.confidenceText, {color: getConfidenceColor(confidence)}]}>
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
        <Text style={styles.title}>Meter Reading Results</Text>
        
        {/* Image Preview */}
        <View style={styles.imagePreview}>
          <Text style={styles.imagePreviewText}>Captured Image</Text>
          {result.imageUrl ? (
            <Image source={{uri: result.imageUrl}} style={styles.capturedImage} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        {/* Fields */}
        {renderField('Meter Serial No.', result.data.serialNumber, 'serialNumber', result.confidence.serialNumber)}
        {renderField('kWh (Total Energy)', result.data.kwh, 'kwh', result.confidence.kwh)}
        {renderField('kVAh', result.data.kvah, 'kvah', result.confidence.kvah)}
        {renderField('Maximum Demand (kW)', result.data.maxDemandKw, 'maxDemandKw', result.confidence.maxDemandKw)}
        {renderField('Demand kVA', result.data.demandKva, 'demandKva', result.confidence.demandKva)}

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
            <Text style={styles.submitButtonText}>Save Reading</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
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
