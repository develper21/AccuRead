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
