import {useState, useCallback} from 'react';
import {CameraQuality} from '../types';

interface UseCameraQualityReturn {
  quality: CameraQuality;
  isQualityAcceptable: boolean;
  qualityWarnings: string[];
  updateQuality: (quality: CameraQuality) => void;
  resetQuality: () => void;
  checkQualityThresholds: (quality: CameraQuality) => boolean;
}

const defaultQuality: CameraQuality = {
  isBlurred: false,
  hasGlare: false,
  isAligned: false,
  brightness: 0,
  sharpness: 0,
};

export const useCameraQuality = (): UseCameraQualityReturn => {
  const [quality, setQuality] = useState<CameraQuality>(defaultQuality);

  const updateQuality = useCallback((newQuality: CameraQuality) => {
    setQuality(newQuality);
  }, []);

  const resetQuality = useCallback(() => {
    setQuality(defaultQuality);
  }, []);

  const checkQualityThresholds = useCallback((qualityToCheck: CameraQuality): boolean => {
    // Define quality thresholds
    const thresholds = {
      minSharpness: 100,
      minBrightness: 30,
      maxBrightness: 200,
    };

    // Check if quality meets thresholds
    const meetsThresholds = 
      !qualityToCheck.isBlurred &&
      !qualityToCheck.hasGlare &&
      qualityToCheck.isAligned &&
      qualityToCheck.sharpness >= thresholds.minSharpness &&
      qualityToCheck.brightness >= thresholds.minBrightness &&
      qualityToCheck.brightness <= thresholds.maxBrightness;

    return meetsThresholds;
  }, []);

  const isQualityAcceptable = checkQualityThresholds(quality);

  const getQualityWarnings = useCallback((): string[] => {
    const warnings: string[] = [];

    if (quality.isBlurred) {
      warnings.push('Image appears blurry - hold steady');
    }

    if (quality.hasGlare) {
      warnings.push('Glare detected - adjust angle');
    }

    if (!quality.isAligned) {
      warnings.push('Meter not aligned with guide');
    }

    if (quality.sharpness < 100) {
      warnings.push('Low sharpness - focus better');
    }

    if (quality.brightness < 30) {
      warnings.push('Too dark - add more light');
    } else if (quality.brightness > 200) {
      warnings.push('Too bright - reduce light');
    }

    return warnings;
  }, [quality]);

  return {
    quality,
    isQualityAcceptable,
    qualityWarnings: getQualityWarnings(),
    updateQuality,
    resetQuality,
    checkQualityThresholds,
  };
};
