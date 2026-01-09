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

import { initializeApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { UserRole } from '../types';
import Config from '../config/env';

// Initialize Firebase with environment configuration
const firebaseConfig = Config.getFirebaseConfig();
let app: any;

try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole; // Integrated roles
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Initialize Google Sign-In
  initializeGoogleSignIn() {
    const googleConfig = Config.getGoogleSignInConfig();
    GoogleSignin.configure({
      webClientId: googleConfig.webClientId || 'YOUR_WEB_CLIENT_ID',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      iosClientId: googleConfig.iosClientId,
    });
  }

  // Check if user is signed in with Google
  async isSignedInWithGoogle(): Promise<boolean> {
    try {
      const isSignedIn = await GoogleSignin.getTokens().then(() => true).catch(() => false);
      return isSignedIn;
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      return false;
    }
  }

  // Get current Google user info
  async getCurrentGoogleUser(): Promise<any> {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return null;
    }
  }

  // Helper to simulate roles for the demo
  private async getUserRole(email: string): Promise<UserRole> {
    if (email?.includes('admin')) return 'ADMIN';
    if (email?.includes('supervisor')) return 'SUPERVISOR';
    return 'FIELD_WORKER';
  }

  // Email/Password Sign Up
  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: await this.getUserRole(user.email || ''),
      };
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Email/Password Sign In
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: await this.getUserRole(user.email || ''),
      };
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      // Get ID token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID Token found');
      }

      // Create Google credential
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in to Firebase with Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      // Get user role based on email
      const role = await this.getUserRole(user.email || '');

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role,
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google Sign-In was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available');
      } else {
        throw new Error(this.getErrorMessage(error.code || 'google-signin-failed'));
      }
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      // Sign out from Firebase
      await auth().signOut();
      
      // Sign out from Google if signed in
      const isGoogleSignedIn = await this.isSignedInWithGoogle();
      if (isGoogleSignedIn) {
        await GoogleSignin.signOut();
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out completely');
    }
  }

  // Get Current User
  async getCurrentUser(): Promise<AuthUser | null> {
    const currentUser = auth().currentUser;
    if (!currentUser) return null;

    return {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      role: await this.getUserRole(currentUser.email || ''),
    };
  }

  // Auth State Observer
  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return auth().onAuthStateChanged(async (user: FirebaseAuthTypes.User | null) => {
      if (user) {
        const role = await this.getUserRole(user.email || '');
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role,
        });
      } else {
        callback(null);
      }
    });
  }

  // Password Reset
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Error Message Handler
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'User not found. Please check your email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'Email is already registered. Please use a different email.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'google-signin-failed':
        return 'Google Sign-In failed. Please try again.';
      case 'google-play-services-not-available':
        return 'Google Play Services not available on this device.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export const authService = AuthService.getInstance();
