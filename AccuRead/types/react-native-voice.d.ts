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

declare module 'react-native-voice' {
    export interface SpeechResultsEvent {
        value?: string[];
    }
    export interface SpeechErrorEvent {
        error?: {
            code?: string;
            message?: string;
        };
    }
    export interface VoiceStatic {
        onSpeechStart?: (e: any) => void;
        onSpeechEnd?: (e: any) => void;
        onSpeechResults?: (e: SpeechResultsEvent) => void;
        onSpeechError?: (e: SpeechErrorEvent) => void;
        start(lang: string): Promise<void>;
        stop(): Promise<void>;
        destroy(): Promise<void>;
        removeAllListeners(): void;
        isAvailable(): Promise<number>;
        isRecognizing(): Promise<number>;
    }
    const Voice: VoiceStatic;
    export default Voice;
}
