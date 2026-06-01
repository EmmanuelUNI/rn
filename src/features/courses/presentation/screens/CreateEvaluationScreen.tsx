import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, HelperText, Text, TextInput, RadioButton, Menu, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AppHeader from '@/src/components/AppHeader';
import { COLORS } from '@/src/config/constants';
import { useCourses } from '../context/courseContext';
import { Category } from '../../domain/entities/Category';
import type { RootStackParamList } from '@/src/AuthFlow';

type RoutePropType = RouteProp<RootStackParamList, 'CreateEvaluation'>;

export default function CreateEvaluationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { course } = route.params;
  const { createActivity, getCategoriesByCourse } = useCourses();

  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getCategoriesByCourse(course._id);
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!selectedCategory) newErrors.category = 'Selecciona una categoría';
    if (!startDate.trim()) newErrors.startDate = 'Requerido';
    if (!startTime.trim()) newErrors.startTime = 'Requerido';
    if (!endDate.trim()) newErrors.endDate = 'Requerido';
    if (!endTime.trim()) newErrors.endTime = 'Requerido';

    // Basic date format validation DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (startDate && !dateRegex.test(startDate)) newErrors.startDate = 'Formato DD/MM/YYYY';
    if (endDate && !dateRegex.test(endDate)) newErrors.endDate = 'Formato DD/MM/YYYY';

    // Basic time format validation HH:MM
    const timeRegex = /^\d{2}:\d{2}$/;
    if (startTime && !timeRegex.test(startTime)) newErrors.startTime = 'Formato HH:MM';
    if (endTime && !timeRegex.test(endTime)) newErrors.endTime = 'Formato HH:MM';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function parseDateTime(dateStr: string, timeStr: string): Date {
    const [d, m, y] = dateStr.split('/').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm);
  }

  async function handleCreate() {
    if (!validate()) return;
    setLoading(true);
    try {
      const start = parseDateTime(startDate, startTime);
      const end = parseDateTime(endDate, endTime);

      if (end <= start) {
        Alert.alert('Error', 'El cierre debe ser posterior al inicio');
        setLoading(false);
        return;
      }

      await createActivity({
        name: name.trim(),
        course_id: course._id,
        category_id: selectedCategory!._id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        is_public: isPublic,
      });

      Alert.alert('Éxito', 'Evaluación creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo crear la evaluación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Crear evaluación" />
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Nombre de la evaluación</Text>
          <TextInput
            mode="outlined"
            placeholder="Ej: Primer Corte"
            value={name}
            onChangeText={setName}
            error={!!errors.name}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
          />
          <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Categoría de grupos</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <TextInput
                  mode="outlined"
                  value={selectedCategory?.name ?? ''}
                  placeholder="Selecciona una categoría"
                  editable={false}
                  pointerEvents="none"
                  error={!!errors.category}
                  right={<TextInput.Icon icon="chevron-down" />}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              </TouchableOpacity>
            }
            contentStyle={{ backgroundColor: '#fff' }}
          >
            {categories.map((cat) => (
              <Menu.Item
                key={cat._id}
                onPress={() => {
                  setSelectedCategory(cat);
                  setMenuVisible(false);
                }}
                title={cat.name}
              />
            ))}
          </Menu>
          <HelperText type="error" visible={!!errors.category}>{errors.category}</HelperText>
        </View>

        <Text style={[styles.label, { alignSelf: 'flex-start', marginTop: 8 }]}>Ventana de tiempo</Text>

        <View style={styles.timeSection}>
          <Text style={styles.subLabel}>Inicio</Text>
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <TextInput
                mode="outlined"
                placeholder="DD/MM/YYYY"
                value={startDate}
                onChangeText={setStartDate}
                error={!!errors.startDate}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                right={<TextInput.Icon icon="calendar" />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <TextInput
                mode="outlined"
                placeholder="HH:MM"
                value={startTime}
                onChangeText={setStartTime}
                error={!!errors.startTime}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                right={<TextInput.Icon icon="clock-outline" />}
              />
            </View>
          </View>
          {(errors.startDate || errors.startTime) && (
            <HelperText type="error" visible={true}>{errors.startDate || errors.startTime}</HelperText>
          )}
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.subLabel}>Cierre</Text>
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <TextInput
                mode="outlined"
                placeholder="DD/MM/YYYY"
                value={endDate}
                onChangeText={setEndDate}
                error={!!errors.endDate}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                right={<TextInput.Icon icon="calendar" />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <TextInput
                mode="outlined"
                placeholder="HH:MM"
                value={endTime}
                onChangeText={setEndTime}
                error={!!errors.endTime}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                right={<TextInput.Icon icon="clock-outline" />}
              />
            </View>
          </View>
          {(errors.endDate || errors.endTime) && (
            <HelperText type="error" visible={true}>{errors.endDate || errors.endTime}</HelperText>
          )}
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Resultados</Text>
          <RadioButton.Group onValueChange={v => setIsPublic(v === 'public')} value={isPublic ? 'public' : 'private'}>
            <View style={styles.radioRow}>
              <RadioButton value="private" color={COLORS.primary} />
              <Text onPress={() => setIsPublic(false)}>Privado</Text>
            </View>
            <View style={styles.radioRow}>
              <RadioButton value="public" color={COLORS.primary} />
              <Text onPress={() => setIsPublic(true)}>Público</Text>
            </View>
          </RadioButton.Group>
        </View>

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          buttonColor={COLORS.primary}
          style={styles.createBtn}
          labelStyle={styles.btnLabel}>
          Crear actividad
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: COLORS.primary },
  content:       { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  scrollContent: { padding: 20 },
  fieldWrap:     { width: '100%', marginBottom: 12 },
  label:         { color: COLORS.primary, fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  subLabel:      { color: COLORS.primary, fontSize: 12, fontWeight: '500', marginBottom: 4 },
  timeSection:   { width: '100%', marginBottom: 16 },
  row:           { flexDirection: 'row' },
  radioRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  createBtn:     { borderRadius: 30, paddingVertical: 6, marginTop: 20, alignSelf: 'center', width: '70%' },
  btnLabel:      { fontSize: 14, fontWeight: 'bold' },
});
