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

import { CameraQuality } from '../types';

/**
 * Stream Processor Service
 * Handles frame-by-frame quality assessment and "Best Frame" selection logic.
 * This simulates high-frequency frame analysis to avoid blurry captures.
 */

export const StreamProcessorService = {
    /**
     * Analyzes a frame's metadata to determine its quality score.
     * In a real implementation, this would be computed using OpenCV or 
     * a Vision Camera Frame Processor Plugin in C++.
     */
    calculateFrameScore: (frameMetadata: any): number => {
        const { sharpness, brightness, glareLevel } = frameMetadata;

        // Simple heuristic: Sharpness is weighted heavily, Glare is a penalty
        let score = sharpness * 1.5 + brightness * 0.5 - glareLevel * 2;
        return Math.max(0, score);
    },

    /**
     * Converts frame metadata to CameraQuality interface
     */
    assessCameraQuality: (frameMetadata: any): CameraQuality => {
        const { sharpness, brightness, glareLevel, alignment } = frameMetadata;
        
        const isBlurred = sharpness < 50; // Threshold for blur detection
        const hasGlare = glareLevel > 70; // Threshold for glare detection
        const isAligned = alignment > 80; // Threshold for alignment detection
        
        return {
            isBlurred,
            hasGlare,
            isAligned,
            brightness,
            sharpness,
        } as CameraQuality;
    },

    /**
     * Enhanced quality assessment using CameraQuality interface
     */
    getQualityAssessment: (frameMetadata: any): {
        quality: CameraQuality;
        score: number;
        recommendation: string;
    } => {
        const quality = StreamProcessorService.assessCameraQuality(frameMetadata);
        const score = StreamProcessorService.calculateFrameScore(frameMetadata);
        
        let recommendation = '';
        if (quality.isBlurred) {
            recommendation = 'Frame is blurred - keep camera steady';
        } else if (quality.hasGlare) {
            recommendation = 'Glare detected - adjust angle or lighting';
        } else if (!quality.isAligned) {
            recommendation = 'Meter not aligned - adjust position';
        } else if (score > 80) {
            recommendation = 'Excellent quality - ready to capture';
        } else {
            recommendation = 'Acceptable quality - can improve';
        }
        
        return {
            quality,
            score,
            recommendation,
        };
    },

    /**
     * Logic to select the best N frames from a stream buffer.
     * This ensures we don't just take the "current" frame which might be mid-motion.
     */
    selectBestFrames: (frameBuffer: { uri: string; score: number; quality?: CameraQuality }[], count: number = 5) => {
        // Sort by score descending and take the top N
        return [...frameBuffer]
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(frame => ({
                ...frame,
                quality: frame.quality || StreamProcessorService.assessCameraQuality({
                    sharpness: frame.score * 0.7, // Estimate sharpness from score
                    brightness: 70,
                    glareLevel: 20,
                    alignment: 85,
                })
            }));
    },

    /**
     * Filter frames based on quality thresholds
     */
    filterByQuality: (frameBuffer: { uri: string; score: number; quality?: CameraQuality }[], minScore: number = 60): {
        uri: string;
        score: number;
        quality: CameraQuality;
    }[] => {
        return frameBuffer
            .filter(frame => frame.score >= minScore)
            .map(frame => ({
                ...frame,
                quality: frame.quality || StreamProcessorService.assessCameraQuality({
                    sharpness: frame.score * 0.7,
                    brightness: 70,
                    glareLevel: 20,
                    alignment: 85,
                })
            }));
    },

    /**
     * Simulates "Ensemble OCR" or "Frame Averaging"
     * In a real system, you might average the pixel values or 
     * perform OCR on all 5 and pick the result with highest confidence.
     */
    getConsensusResult: (results: any[]) => {
        if (results.length === 0) return null;

        // Sort by confidence and return the most reliable reading
        return results.sort((a, b) => {
            const avgA = Object.values(a.confidence).reduce((sum: any, val: any) => sum + val, 0) as number;
            const avgB = Object.values(b.confidence).reduce((sum: any, val: any) => sum + val, 0) as number;
            return avgB - avgA;
        })[0];
    },

    /**
     * Analyze stream quality over time
     */
    analyzeStreamQuality: (frameBuffer: { score: number; timestamp: number }[]): {
        averageScore: number;
        trend: 'improving' | 'declining' | 'stable';
        recommendations: string[];
    } => {
        if (frameBuffer.length === 0) {
            return {
                averageScore: 0,
                trend: 'stable',
                recommendations: ['No frames to analyze'],
            };
        }

        const scores = frameBuffer.map(f => f.score);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        
        // Calculate trend
        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (secondAvg > firstAvg + 5) trend = 'improving';
        else if (secondAvg < firstAvg - 5) trend = 'declining';
        
        // Generate recommendations
        const recommendations: string[] = [];
        if (averageScore < 60) {
            recommendations.push('Improve lighting conditions');
            recommendations.push('Keep camera steady');
        }
        if (trend === 'declining') {
            recommendations.push('Camera movement detected - hold steady');
        }
        if (recommendations.length === 0) {
            recommendations.push('Good stream quality');
        }
        
        return {
            averageScore,
            trend,
            recommendations,
        };
    },

    /**
     * Get optimal capture moment based on stream analysis
     */
    getOptimalCaptureMoment: (frameBuffer: { uri: string; score: number; timestamp: number }[]): {
        frame: { uri: string; score: number; timestamp: number } | null;
        quality: CameraQuality | null;
        confidence: number;
    } => {
        if (frameBuffer.length === 0) {
            return {
                frame: null,
                quality: null,
                confidence: 0,
            };
        }

        // Find the best frame
        const bestFrame = frameBuffer.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        // Assess quality
        const quality = StreamProcessorService.assessCameraQuality({
            sharpness: bestFrame.score * 0.7,
            brightness: 70,
            glareLevel: 20,
            alignment: 85,
        });
        
        // Calculate confidence based on quality factors
        let confidence = bestFrame.score;
        if (quality.isBlurred) confidence *= 0.5;
        if (quality.hasGlare) confidence *= 0.7;
        if (!quality.isAligned) confidence *= 0.8;
        
        return {
            frame: bestFrame,
            quality,
            confidence,
        };
    },
};
