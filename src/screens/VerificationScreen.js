// src/screens/VerificationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/api';

export default function VerificationScreen() {
  const { verifyAccount, userEmail, userPassword, userName } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!code) { setError('Ingresa el código de verificación'); return false; }
    if (code.trim().length !== 6) { setError('El código debe tener 6 dígitos'); return false; }
    setError('');
    return true;
  }

  async function handleVerify() {
    if (!validate()) return;
    setLoading(true);
    try {
      await verifyAccount(userEmail, code.trim(), userPassword, userName);
    } catch (e) {
      Alert.alert('Error', e.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.flex}>
      <View style={styles.topCurve}>
        <Image
          source={require('../../assets/logo_sin_fondo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Verificación</Text>

        {!!userEmail && (
          <Text style={styles.subtitle}>
            Te enviamos un código de verificación a {userEmail}
          </Text>
        )}

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Código de verificación</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Ingresa el código"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#dcd7d4" />
            : <Text style={styles.btnText}>Verificar código</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  },
  logo: { height: 90, width: 160 },
  content: { paddingHorizontal: '15%', paddingTop: 20, paddingBottom: 40, alignItems: 'center' },
  title: { fontSize: 38, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  subtitle: { color: COLORS.primary, textAlign: 'center', marginBottom: 24, fontSize: 14 },
  fieldWrap: { width: '100%', marginBottom: 20 },
  label: { color: COLORS.primary, fontWeight: 'bold', marginBottom: 8, fontSize: 13 },
  input: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#ccc',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333',
  },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 11, marginTop: 4 },
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 13, paddingHorizontal: 36, alignItems: 'center', minWidth: 160,
  },
  btnText: { color: '#dcd7d4', fontWeight: 'bold', fontSize: 15 },
});