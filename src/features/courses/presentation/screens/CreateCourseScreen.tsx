import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AppHeader from '@/src/components/AppHeader';
import { COLORS } from '@/src/config/constants';
import { useCourses } from '../context/courseContext';

export default function CreateCourseScreen() {
  const navigation = useNavigation();
  const { createCourse } = useCourses();
  const [name, setName] = useState('');
  const [nrc, setNrc] = useState('');
  const [nameError, setNameError] = useState('');
  const [nrcError, setNrcError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    let valid = true;
    setNameError(''); setNrcError('');
    if (!name.trim()) { setNameError('El nombre es obligatorio'); valid = false; }
    if (!nrc) { setNrcError('El NRC es obligatorio'); valid = false; }
    else if (!/^\d{4}$/.test(nrc)) { setNrcError('El NRC debe ser un número de 4 dígitos'); valid = false; }
    return valid;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      await createCourse(name.trim(), nrc);
      Alert.alert('Éxito', 'Curso creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo crear el curso');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Crear curso" />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Nombre del curso</Text>
          <TextInput
            mode="outlined"
            label="Nombre del curso"
            value={name}
            onChangeText={v => { setName(v); if (nameError) setNameError(''); }}
            error={!!nameError}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          <HelperText type="error" visible={!!nameError}>{nameError}</HelperText>
        </View>

        <View style={[styles.fieldWrap, { marginTop: 8 }]}>
          <Text style={styles.label}>NRC</Text>
          <TextInput
            mode="outlined"
            label="NRC (4 dígitos)"
            value={nrc}
            onChangeText={v => { setNrc(v); if (nrcError) setNrcError(''); }}
            keyboardType="number-pad"
            maxLength={4}
            error={!!nrcError}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          <HelperText type="error" visible={!!nrcError}>{nrcError}</HelperText>
        </View>

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          buttonColor={COLORS.primary}
          style={styles.createBtn}>
          Crear curso
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: COLORS.primary },
  content:       { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  scrollContent: { padding: 24, alignItems: 'center' },
  fieldWrap:     { width: '100%' },
  label:         { color: COLORS.primary, fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  createBtn:     { borderRadius: 30, paddingVertical: 4, marginTop: 24, width: '60%' },
});