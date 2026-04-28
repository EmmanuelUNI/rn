// src/screens/CreateCourseScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import CourseService from '../services/courseService';
import StorageService from '../services/storageService';
import { COLORS } from '../config/api';

export default function CreateCourseScreen({ navigation }) {
  const [name, setName] = useState('');
  const [nrc, setNrc] = useState('');
  const [nameError, setNameError] = useState('');
  const [nrcError, setNrcError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    let valid = true;
    setNameError('');
    setNrcError('');

    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      valid = false;
    }
    if (!nrc) {
      setNrcError('El NRC es obligatorio');
      valid = false;
    } else if (!/^\d{4}$/.test(nrc)) {
      setNrcError('El NRC debe ser un número de 4 dígitos');
      valid = false;
    }
    return valid;
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      const userId = await StorageService.get('userId');
      await CourseService.createCourse(name.trim(), nrc, userId);
      Alert.alert('Éxito', 'Curso creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo crear el curso');
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
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="Nombre del curso"
            placeholderTextColor="#999"
          />
          {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
        </View>

        <View style={[styles.fieldWrap, { marginTop: 24 }]}>
          <Text style={styles.label}>NRC</Text>
          <TextInput
            style={[styles.input, nrcError ? styles.inputError : null]}
            value={nrc}
            onChangeText={setNrc}
            placeholder="NRC (4 dígitos)"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={4}
          />
          {!!nrcError && <Text style={styles.errorText}>{nrcError}</Text>}
        </View>

        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.createBtnText}>Crear curso</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: { padding: 24, alignItems: 'center' },
  fieldWrap: { width: '100%' },
  label: { color: COLORS.primary, fontWeight: 'bold', marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#333',
  },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 4 },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 30,
    alignItems: 'center',
    minWidth: 160,
  },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});