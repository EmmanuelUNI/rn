import React, { useEffect, useState, useRef } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Button, HelperText, Text, TextInput, RadioButton, Menu } from 'react-native-paper';
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

  // Refs for hidden web inputs
  const startDateRef = useRef<any>(null);
  const startTimeRef = useRef<any>(null);
  const endDateRef = useRef<any>(null);
  const endTimeRef = useRef<any>(null);

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

    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (startDate && !dateRegex.test(startDate)) newErrors.startDate = 'Formato DD/MM/YYYY';
    if (endDate && !dateRegex.test(endDate)) newErrors.endDate = 'Formato DD/MM/YYYY';

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

  const pickDate = (setter: (v: string) => void, ref: any) => {
    if (Platform.OS === 'web' && ref.current) {
      ref.current.showPicker?.() || ref.current.focus() || ref.current.click();
    } else {
      const d = new Date();
      const formatted = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      setter(formatted);
      Alert.alert('Info', 'En un dispositivo móvil se abriría el calendario nativo.');
    }
  };

  const pickTime = (setter: (v: string) => void, ref: any) => {
    if (Platform.OS === 'web' && ref.current) {
      ref.current.showPicker?.() || ref.current.focus() || ref.current.click();
    } else {
      const d = new Date();
      const formatted = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      setter(formatted);
      Alert.alert('Info', 'En un dispositivo móvil se abriría el reloj nativo.');
    }
  };

  const handleWebDateChange = (e: any, setter: (v: string) => void) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split('-');
    setter(`${d}/${m}/${y}`);
  };

  const handleWebTimeChange = (e: any, setter: (v: string) => void) => {
    const val = e.target.value; // HH:MM
    if (!val) return;
    setter(val);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Crear evaluación" />
      {/* Hidden Web Native Inputs */}
      {Platform.OS === 'web' && (
        <View style={{ height: 0, width: 0, opacity: 0, position: 'absolute' }}>
          <input
            type="date"
            ref={startDateRef}
            style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            onChange={(e) => handleWebDateChange(e, setStartDate)}
          />
          <input
            type="time"
            ref={startTimeRef}
            style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            onChange={(e) => handleWebTimeChange(e, setStartTime)}
          />
          <input
            type="date"
            ref={endDateRef}
            style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            onChange={(e) => handleWebDateChange(e, setEndDate)}
          />
          <input
            type="time"
            ref={endTimeRef}
            style={{ position: 'absolute', top: 0, left: 0, opacity: 0 }}
            onChange={(e) => handleWebTimeChange(e, setEndTime)}
          />
        </View>
      )}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionLabel}>Nombre de la evaluación</Text>
          <TextInput
            mode="outlined"
            placeholder="Ej: Primer Corte"
            value={name}
            onChangeText={setName}
            error={!!errors.name}
            style={styles.input}
            outlineStyle={styles.outline}
            activeOutlineColor={COLORS.primary}
            contentStyle={styles.inputContent}
          />
          <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

          <Text style={styles.sectionLabel}>Categoría de grupos</Text>
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
                  style={styles.input}
                  outlineStyle={styles.outline}
                  activeOutlineColor={COLORS.primary}
                  contentStyle={styles.inputContent}
                  right={<TextInput.Icon icon="chevron-down" color={COLORS.primary} />}
                />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            {categories.map((cat) => (
              <Menu.Item
                key={cat._id}
                onPress={() => {
                  setSelectedCategory(cat);
                  setMenuVisible(false);
                }}
                title={cat.name}
                titleStyle={styles.menuItemText}
              />
            ))}
          </Menu>
          <HelperText type="error" visible={!!errors.category}>{errors.category}</HelperText>

          <Text style={styles.sectionLabel}>Ventana de tiempo</Text>
          
          <Text style={styles.subLabel}>Inicio</Text>
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <TextInput
                mode="outlined"
                placeholder="Fecha"
                value={startDate}
                onChangeText={setStartDate}
                error={!!errors.startDate}
                style={styles.input}
                outlineStyle={styles.outline}
                activeOutlineColor={COLORS.primary}
                contentStyle={styles.inputContent}
                right={<TextInput.Icon icon="calendar-month-outline" color={COLORS.primary} onPress={() => pickDate(setStartDate, startDateRef)} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <TextInput
                mode="outlined"
                placeholder="Hora"
                value={startTime}
                onChangeText={setStartTime}
                error={!!errors.startTime}
                style={styles.input}
                outlineStyle={styles.outline}
                activeOutlineColor={COLORS.primary}
                contentStyle={styles.inputContent}
                right={<TextInput.Icon icon="clock-outline" color={COLORS.primary} onPress={() => pickTime(setStartTime, startTimeRef)} />}
              />
            </View>
          </View>
          {(errors.startDate || errors.startTime) && (
            <HelperText type="error" visible={true}>{errors.startDate || errors.startTime}</HelperText>
          )}

          <Text style={[styles.subLabel, { marginTop: 12 }]}>Cierre</Text>
          <View style={styles.row}>
            <View style={{ flex: 2 }}>
              <TextInput
                mode="outlined"
                placeholder="Fecha"
                value={endDate}
                onChangeText={setEndDate}
                error={!!errors.endDate}
                style={styles.input}
                outlineStyle={styles.outline}
                activeOutlineColor={COLORS.primary}
                contentStyle={styles.inputContent}
                right={<TextInput.Icon icon="calendar-month-outline" color={COLORS.primary} onPress={() => pickDate(setEndDate, endDateRef)} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <TextInput
                mode="outlined"
                placeholder="Hora"
                value={endTime}
                onChangeText={setEndTime}
                error={!!errors.endTime}
                style={styles.input}
                outlineStyle={styles.outline}
                activeOutlineColor={COLORS.primary}
                contentStyle={styles.inputContent}
                right={<TextInput.Icon icon="clock-outline" color={COLORS.primary} onPress={() => pickTime(setEndTime, endTimeRef)} />}
              />
            </View>
          </View>
          {(errors.endDate || errors.endTime) && (
            <HelperText type="error" visible={true}>{errors.endDate || errors.endTime}</HelperText>
          )}

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Resultados</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={styles.radioOption} 
              onPress={() => setIsPublic(false)}
              activeOpacity={0.7}
            >
              <RadioButton 
                value="private" 
                status={!isPublic ? 'checked' : 'unchecked'} 
                onPress={() => setIsPublic(false)}
                color={COLORS.primary}
              />
              <Text style={styles.radioText}>Privado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.radioOption} 
              onPress={() => setIsPublic(true)}
              activeOpacity={0.7}
            >
              <RadioButton 
                value="public" 
                status={isPublic ? 'checked' : 'unchecked'} 
                onPress={() => setIsPublic(true)}
                color={COLORS.primary}
              />
              <Text style={styles.radioText}>Público</Text>
            </TouchableOpacity>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: COLORS.primary },
  content:       { 
    flex: 1, 
    backgroundColor: '#F4F4F4', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28,
  },
  scrollContent: { padding: 20 },
  formContainer: { width: '100%' },
  sectionLabel:  { color: COLORS.primary, fontWeight: 'bold', marginBottom: 8, fontSize: 13 },
  subLabel:      { color: COLORS.primary, fontSize: 11, fontWeight: '500', marginBottom: 4 },
  input:         { backgroundColor: '#FFFFFF', marginBottom: 2, height: 48 },
  inputContent:  { fontSize: 13, color: COLORS.primary },
  outline:       { borderRadius: 12, borderSide: { color: '#B6A9D0' } },
  row:           { flexDirection: 'row' },
  radioGroup:    { marginTop: 4 },
  radioOption:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radioText:     { color: COLORS.primary, fontSize: 13, fontWeight: '500' },
  menuContent:   { backgroundColor: '#FFFFFF', borderRadius: 12 },
  menuItemText:  { fontSize: 13, color: '#333' },
  createBtn:     { borderRadius: 24, paddingVertical: 4, marginTop: 24, alignSelf: 'center', width: '60%', elevation: 0 },
  btnLabel:      { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
});
