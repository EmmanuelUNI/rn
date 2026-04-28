// src/screens/RegisterScreen.js
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

export default function RegisterScreen() {
  const { signUp, setIsSigningUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Ingresa tu nombre';
    if (!email.trim()) {
      newErrors.email = 'Ingresa tu correo';
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      newErrors.email = 'Correo inválido';
    }

    if (!password) {
      newErrors.password = 'Ingresa tu contraseña';
    } else {
      const errs = [];
      if (password.length < 8) errs.push('• 8 caracteres');
      if (!/[A-Z]/.test(password)) errs.push('• Una mayúscula');
      if (!/[a-z]/.test(password)) errs.push('• Una minúscula');
      if (!/\d/.test(password)) errs.push('• Un número');
      if (!/[^A-Za-z0-9]/.test(password)) errs.push('• Un símbolo');
      if (errs.length) newErrors.password = `Debe tener:\n${errs.join('\n')}`;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo registrar el usuario');
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, value, onChangeText, placeholder, secure, keyboardType, error }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secure}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topCurve}>
        <Image
          source={require('../../assets/logo_sin_fondo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Registro</Text>

        <Field
          label="Nombre completo"
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />
        <Field
          label="Correo"
          placeholder="Correo institucional"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          error={errors.email}
        />
        <Field
          label="Contraseña"
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secure
          error={errors.password}
        />
        <Field
          label="Confirmar contraseña"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure
          error={errors.confirmPassword}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#dcd7d4" />
          ) : (
            <Text style={styles.btnText}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSigningUp(false)}>
          <Text style={styles.loginLink}>¿Ya tienes una cuenta?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  topCurve: {
    backgroundColor: COLORS.primary,
    height: 180,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  logo: { height: 90, width: 160 },
  scrollContent: {
    paddingHorizontal: '15%',
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  fieldWrap: { width: '100%', marginBottom: 16 },
  label: { color: COLORS.primary, fontWeight: 'bold', marginBottom: 6, fontSize: 13 },
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
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 11, marginTop: 4 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 36,
    marginTop: 10,
    alignItems: 'center',
    minWidth: 150,
  },
  btnText: { color: '#dcd7d4', fontWeight: 'bold', fontSize: 15 },
  loginLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 14,
  },
});