import React, { useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { COLORS } from '@/src/config/constants';
import { useAuth } from '../context/authContext';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { login, setIsSigningUp, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscure, setObscure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const passwordRef = useRef<RNTextInput>(null);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!email.trim()) e.email = 'Ingresa tu correo';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) e.email = 'Correo inválido';
    if (!password) e.password = 'Ingresa tu contraseña';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    Keyboard.dismiss();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.topCurve}>
        <Image
          source={require('../../../../../assets/logo_sin_fondo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text variant="headlineLarge" style={styles.welcome}>Bienvenido</Text>

        {/* EMAIL */}
        <View style={styles.fieldWrap}>
          <Text variant="labelLarge" style={styles.label}>Usuario</Text>
          <TextInput
            testID="email-input"
            mode="outlined"
            label="Correo Institucional"
            value={email}
            onChangeText={v => { setEmail(v); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={!!errors.email}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          <HelperText type="error" visible={!!errors.email}>{errors.email}</HelperText>
        </View>

        {/* PASSWORD */}
        <View style={styles.fieldWrap}>
          <Text variant="labelLarge" style={styles.label}>Contraseña</Text>
          <TextInput
            testID="password-input"
            ref={passwordRef}
            mode="outlined"
            label="Contraseña"
            value={password}
            onChangeText={v => { setPassword(v); if (errors.password) setErrors(e => ({ ...e, password: undefined })); }}
            secureTextEntry={obscure}
            right={
              <TextInput.Icon
                icon={obscure ? 'eye-outline' : 'eye-off-outline'}
                onPress={() => setObscure(v => !v)}
              />
            }
            error={!!errors.password}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          <HelperText type="error" visible={!!errors.password}>{errors.password}</HelperText>
        </View>

        <Button
          testID="login-button"
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          buttonColor={COLORS.primary}
          style={styles.loginBtn}>
          Iniciar sesión
        </Button>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => setIsSigningUp(true)}>
            <Text style={styles.registerLink}> Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={clearError} duration={3000}
        action={{ label: 'Cerrar', onPress: clearError }}>
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:        { flex: 1, backgroundColor: '#FFFFFF' },
  topCurve: {
    backgroundColor: COLORS.primary,
    height: 220,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  logo:         { height: 100, width: 180 },
  scrollContent: { paddingHorizontal: '10%', paddingTop: 20, paddingBottom: 40, alignItems: 'center' },
  welcome:      { color: COLORS.primary, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  fieldWrap:    { width: '100%', marginBottom: 4 },
  label:        { color: COLORS.primary, fontWeight: 'bold', marginBottom: 4 },
  loginBtn:     { marginTop: 16, borderRadius: 12, paddingVertical: 4, width: '100%' },
  registerRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  registerText: { color: '#555', fontSize: 13 },
  registerLink: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
});