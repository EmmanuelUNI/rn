import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { COLORS } from '@/src/config/constants';
import { useAuth } from '../context/authContext';

export default function VerificationScreen() {
  const { verifyAccount, userEmail, userPassword, userName, error, clearError } = useAuth();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!code) { setCodeError('Ingresa el código'); return false; }
    if (code.trim().length !== 6) { setCodeError('El código debe tener 6 dígitos'); return false; }
    setCodeError('');
    return true;
  }

  async function handleVerify() {
    if (!validate()) return;
    setLoading(true);
    try {
      await verifyAccount(userEmail, code.trim(), userPassword, userName);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.flex}>
      <View style={styles.topCurve}>
        <Image
          source={require('../../../../../assets/logo_sin_fondo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineLarge" style={styles.title}>Verificación</Text>

        {!!userEmail && (
          <Text style={styles.subtitle}>
            Te enviamos un código de verificación a {userEmail}
          </Text>
        )}

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Código de verificación</Text>
          <TextInput
            mode="outlined"
            label="Ingresa el código"
            value={code}
            onChangeText={v => { setCode(v); if (codeError) setCodeError(''); }}
            keyboardType="number-pad"
            maxLength={6}
            error={!!codeError}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          <HelperText type="error" visible={!!codeError}>{codeError}</HelperText>
        </View>

        <Button
          mode="contained"
          onPress={handleVerify}
          loading={loading}
          disabled={loading}
          buttonColor={COLORS.primary}
          style={styles.btn}>
          Verificar código
        </Button>
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={clearError} duration={3000}
        action={{ label: 'Cerrar', onPress: clearError }}>
        {error}
      </Snackbar>
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
  logo:      { height: 90, width: 160 },
  content:   { paddingHorizontal: '10%', paddingTop: 20, paddingBottom: 40, alignItems: 'center' },
  title:     { color: COLORS.primary, fontWeight: 'bold', marginBottom: 12 },
  subtitle:  { color: COLORS.primary, textAlign: 'center', marginBottom: 24, fontSize: 14 },
  fieldWrap: { width: '100%', marginBottom: 12 },
  label:     { color: COLORS.primary, fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  btn:       { borderRadius: 12, paddingVertical: 4, width: '100%' },
});