import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import { COLORS } from '@/src/config/constants';
import { useAuth } from '../context/authContext';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const { signUp, setIsSigningUp, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [obscure, setObscure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const e: FormErrors = {};
    if (!name.trim()) e.name = 'Ingresa tu nombre';
    if (!email.trim()) e.email = 'Ingresa tu correo';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) e.email = 'Correo inválido';
    if (!password) {
      e.password = 'Ingresa tu contraseña';
    } else {
      const errs: string[] = [];
      if (password.length < 8)          errs.push('• 8 caracteres');
      if (!/[A-Z]/.test(password))       errs.push('• Una mayúscula');
      if (!/[a-z]/.test(password))       errs.push('• Una minúscula');
      if (!/\d/.test(password))          errs.push('• Un número');
      if (!/[^A-Za-z0-9]/.test(password)) errs.push('• Un símbolo');
      if (errs.length) e.password = `Debe tener:\n${errs.join('\n')}`;
    }
    if (!confirm) e.confirmPassword = 'Confirma tu contraseña';
    else if (confirm !== password) e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    Keyboard.dismiss();
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
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
        <Text variant="headlineLarge" style={styles.title}>Registro</Text>

        {([
          { label: 'Nombre completo', value: name, setter: setName, key: 'name', placeholder: 'Nombre completo' },
          { label: 'Correo',          value: email, setter: setEmail, key: 'email', placeholder: 'Correo institucional', keyboard: 'email-address' as const },
          { label: 'Contraseña',      value: password, setter: setPassword, key: 'password', placeholder: 'Contraseña', secure: true },
          { label: 'Confirmar',       value: confirm, setter: setConfirm, key: 'confirmPassword', placeholder: 'Confirmar contraseña', secure: true },
        ] as const).map(f => (
          <View key={f.key} style={styles.fieldWrap}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              mode="outlined"
              label={f.placeholder}
              value={f.value as string}
              onChangeText={v => {
                (f.setter as (v: string) => void)(v);
                if ((errors as any)[f.key]) setErrors(e => ({ ...e, [f.key]: undefined }));
              }}
              secureTextEntry={f.secure && obscure}
              keyboardType={(f as any).keyboard ?? 'default'}
              autoCapitalize="none"
              error={!!(errors as any)[f.key]}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              right={f.secure ? (
                <TextInput.Icon
                  icon={obscure ? 'eye-outline' : 'eye-off-outline'}
                  onPress={() => setObscure(v => !v)}
                />
              ) : undefined}
            />
            <HelperText type="error" visible={!!(errors as any)[f.key]}>
              {(errors as any)[f.key]}
            </HelperText>
          </View>
        ))}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          buttonColor={COLORS.primary}
          style={styles.btn}>
          Registrarse
        </Button>

        <TouchableOpacity onPress={() => setIsSigningUp(false)}>
          <Text style={styles.loginLink}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={clearError} duration={3000}
        action={{ label: 'Cerrar', onPress: clearError }}>
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:         { flex: 1, backgroundColor: '#FFFFFF' },
  topCurve: {
    backgroundColor: COLORS.primary,
    height: 180,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:         { height: 90, width: 160 },
  scrollContent: { paddingHorizontal: '10%', paddingTop: 16, paddingBottom: 40, alignItems: 'center' },
  title:        { color: COLORS.primary, fontWeight: 'bold', marginBottom: 16 },
  fieldWrap:    { width: '100%', marginBottom: 4 },
  label:        { color: COLORS.primary, fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  btn:          { marginTop: 8, borderRadius: 12, width: '100%', paddingVertical: 4 },
  loginLink:    { color: COLORS.primary, fontWeight: 'bold', fontSize: 13, marginTop: 14 },
});