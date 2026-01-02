import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Theme } from '../utils/theme';

type AuthMode = 'signin' | 'signup' | 'forgot';

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { 
    loading, 
    error, 
    signIn, 
    signUp, 
    signInWithGoogle, 
    resetPassword,
    clearError 
  } = useAuth();

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      // Error is already handled by useAuth hook
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is already handled by useAuth hook
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert('Success', 'Password reset email sent!');
      setMode('signin');
    } catch (error) {
      // Error is already handled by useAuth hook
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'signin':
        return (
          <>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={styles.forgotButton}
              onPress={() => setMode('forgot')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('signup')}>
              <Text style={styles.switchText}>
                Don't have an account? <Text style={styles.switchTextBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </>
        );

      case 'signup':
        return (
          <>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Theme.colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Text style={styles.googleButtonText}>Sign up with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('signin')}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </>
        );

      case 'forgot':
        return (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Email</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode('signin')}>
              <Text style={styles.switchText}>
                <Text style={styles.switchTextBold}>Back to Sign In</Text>
              </Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.logo}>AccuRead</Text>
          {renderForm()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  input: {
    backgroundColor: Theme.colors.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  button: {
    borderRadius: Theme.borderRadius.md,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  googleButton: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.lg,
  },
  forgotText: {
    color: Theme.colors.primary,
    fontSize: 14,
  },
  switchText: {
    textAlign: 'center',
    color: Theme.colors.textSecondary,
    fontSize: 14,
    marginTop: Theme.spacing.md,
  },
  switchTextBold: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default AuthScreen;
