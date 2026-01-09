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

import { useState, useCallback } from 'react';
import { CameraQuality } from '../types';

interface UseCameraQualityReturn {
  quality: CameraQuality;
  isQualityAcceptable: boolean;
  qualityWarnings: string[];
  voiceMessage: string | null;
  updateQuality: (quality: CameraQuality) => void;
  resetQuality: () => void;
  checkQualityThresholds: (quality: CameraQuality) => boolean;
  shouldTriggerFlash: boolean;
}

const defaultQuality: CameraQuality = {
  isBlurred: false,
  hasGlare: false,
  isAligned: false,
  brightness: 100, // Default to normal light
  sharpness: 100,
};

export const useCameraQuality = (): UseCameraQualityReturn => {
  const [quality, setQuality] = useState<CameraQuality>(defaultQuality);

  const updateQuality = useCallback((newQuality: CameraQuality) => {
    setQuality(newQuality);
  }, []);

  const resetQuality = useCallback(() => {
    setQuality(defaultQuality);
  }, []);

  const thresholds = {
    minSharpness: 100,
    minBrightness: 30,
    maxBrightness: 250,
  };

  const checkQualityThresholds = useCallback((qualityToCheck: CameraQuality): boolean => {
    return (
      !qualityToCheck.isBlurred &&
      !qualityToCheck.hasGlare &&
      qualityToCheck.isAligned &&
      qualityToCheck.sharpness >= thresholds.minSharpness &&
      qualityToCheck.brightness >= thresholds.minBrightness &&
      qualityToCheck.brightness <= thresholds.maxBrightness
    );
  }, []);

  const isQualityAcceptable = checkQualityThresholds(quality);
  const shouldTriggerFlash = quality.brightness < thresholds.minBrightness;

  const getQualityWarnings = useCallback((): { warnings: string[], topWarning: string | null } => {
    const warnings: string[] = [];
    let topWarning: string | null = null;

    if (quality.isBlurred) {
      warnings.push('Image appears blurry - hold steady');
      topWarning = "Hold steady, photo is blurry.";
    } else if (quality.hasGlare) {
      warnings.push('Glare detected - adjust angle');
      topWarning = "Too much reflection. Tilt the phone.";
    } else if (!quality.isAligned) {
      warnings.push('Meter not aligned with guide');
      topWarning = "Bring the meter into the blue box.";
    } else if (quality.brightness < thresholds.minBrightness) {
      warnings.push('Too dark - flash recommended');
      topWarning = "Too dark. Turning on flash.";
    }

    return { warnings, topWarning };
  }, [quality]);

  const { warnings, topWarning } = getQualityWarnings();

  return {
    quality,
    isQualityAcceptable,
    qualityWarnings: warnings,
    voiceMessage: topWarning,
    updateQuality,
    resetQuality,
    checkQualityThresholds,
    shouldTriggerFlash,
  };
};
