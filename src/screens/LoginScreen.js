// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/api';

export default function LoginScreen() {
  const { login, setIsSigningUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Ingresa tu correo');
      valid = false;
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      setEmailError('Correo inválido');
      valid = false;
    }

    if (!password) {
      setPasswordError('Ingresa tu contraseña');
      valid = false;
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Error', e.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      // ✅ 'height' funciona mejor en Android que undefined
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      {/* Purple curved top area */}
      <View style={styles.topCurve}>
        <Image
          source={require('../../assets/logo_sin_fondo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.welcome}>Bienvenido</Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Correo Institucional"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
        </View>

        <View style={[styles.fieldWrap, { marginTop: 20 }]}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="Contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#dcd7d4" />
          ) : (
            <Text style={styles.loginBtnText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => setIsSigningUp(true)}>
            <Text style={styles.registerLink}> Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  topCurve: {
    backgroundColor: COLORS.primary,
    height: 220,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  logo: {
    height: 100,
    width: 180,
  },
  scrollContent: {
    paddingHorizontal: '15%',
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  fieldWrap: {
    width: '100%',
  },
  label: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 30,
    alignItems: 'center',
    minWidth: 160,
  },
  loginBtnText: {
    color: '#dcd7d4',
    fontWeight: 'bold',
    fontSize: 15,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    color: '#555',
    fontSize: 13,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
});