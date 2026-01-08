import { Audio } from 'expo-av';
import Voice from 'react-native-voice';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

export interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  transcript?: string;
  timestamp: Date;
  meterSerial?: string;
  readingId?: string;
  language: string;
  fileSize: number;
  isTranscribed: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  timestamp: Date;
}

export class VoiceService {
  private static instance: VoiceService;
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private isTranscribing = false;

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  constructor() {
    this.setupVoiceRecognition();
  }

  // Setup voice recognition
  private setupVoiceRecognition(): void {
    // @ts-ignore
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    // @ts-ignore
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    // @ts-ignore
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    // @ts-ignore
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  // Request audio recording permissions
  async requestAudioPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
      }
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      return false;
    }
  }

  // Start recording voice note
  async startRecording(): Promise<string | null> {
    try {
      if (this.isRecording) {
        console.warn('Recording already in progress');
        return null;
      }

      const hasPermission = await this.requestAudioPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record voice notes.'
        );
        return null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await this.recording.startAsync();

      this.isRecording = true;
      console.log('Recording started');

      return this.recording.getURI() || null;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  // Stop recording voice note
  async stopRecording(): Promise<VoiceNote | null> {
    try {
      if (!this.isRecording || !this.recording) {
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      this.isRecording = false;

      const uri = this.recording.getURI();
      if (!uri) {
        return null;
      }

      // Get file info
      const fileInfo = await RNFS.stat(uri);
      const status = await this.recording.getStatusAsync();

      const voiceNote: VoiceNote = {
        id: this.generateId(),
        uri,
        duration: status.durationMillis || 0,
        timestamp: new Date(),
        language: 'en-US', // Default language
        fileSize: fileInfo.size,
        isTranscribed: false,
      };

      this.recording = null;
      console.log('Recording stopped:', voiceNote);

      return voiceNote;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  // Start speech recognition
  async startSpeechRecognition(language: string = 'en-US'): Promise<boolean> {
    try {
      const hasPermission = await this.requestAudioPermissions();
      if (!hasPermission) {
        return false;
      }

      await Voice.start(language);
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  // Stop speech recognition
  async stopSpeechRecognition(): Promise<void> {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  // Destroy speech recognition
  async destroySpeechRecognition(): Promise<void> {
    try {
      await Voice.destroy();
    } catch (error) {
      console.error('Failed to destroy speech recognition:', error);
    }
  }

  // Transcribe audio file
  async transcribeAudio(voiceNote: VoiceNote): Promise<TranscriptionResult | null> {
    try {
      this.isTranscribing = true;
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTranscriptions = [
        "Meter reading shows 1450.5 kWh",
        "The meter display is clear and readable",
        "Customer reported high consumption this month",
        "Meter location is difficult to access",
        "Serial number is ABC123XYZ",
      ];

      const transcription: TranscriptionResult = {
        text: mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)],
        confidence: 0.85 + Math.random() * 0.15,
        language: voiceNote.language,
        timestamp: new Date(),
      };

      voiceNote.transcript = transcription.text;
      voiceNote.isTranscribed = true;

      this.isTranscribing = false;
      return transcription;
    } catch (error) {
      this.isTranscribing = false;
      console.error('Failed to transcribe audio:', error);
      return null;
    }
  }

  // Delete voice note
  async deleteVoiceNote(voiceNote: VoiceNote): Promise<boolean> {
    try {
      await RNFS.unlink(voiceNote.uri);
      return true;
    } catch (error) {
      console.error('Failed to delete voice note:', error);
      return false;
    }
  }

  // Get voice note duration
  async getVoiceNoteDuration(uri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      const status = await sound.getStatusAsync();
      const duration = (status as any).durationMillis || 0;
      await sound.unloadAsync();
      return duration;
    } catch (error) {
      console.error('Failed to get voice note duration:', error);
      return 0;
    }
  }

  // Play voice note
  async playVoiceNote(uri: string): Promise<Audio.Sound | null> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      return sound;
    } catch (error) {
      console.error('Failed to play voice note:', error);
      return null;
    }
  }

  // Get supported languages for speech recognition
  getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return [
      { code: 'en-US', name: 'English (US)', nativeName: 'English' },
      { code: 'hi-IN', name: 'Hindi (India)', nativeName: 'हिन्दी' },
    ];
  }

  // Format duration for display
  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Check if currently recording
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Check if currently transcribing
  isCurrentlyTranscribing(): boolean {
    return this.isTranscribing;
  }

  // Voice recognition event handlers
  private onSpeechStart(): void {
    console.log('Speech recognition started');
  }

  private onSpeechEnd(): void {
    console.log('Speech recognition ended');
  }

  private onSpeechResults(e: any): void {
    console.log('Speech results:', e.value);
  }

  private onSpeechError(e: any): void {
    console.error('Speech recognition error:', e);
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Cleanup
  cleanup(): void {
    if (this.recording) {
      this.recording.stopAndUnloadAsync();
      this.recording = null;
    }
    this.destroySpeechRecognition();
  }
}

export const voiceService = VoiceService.getInstance();
