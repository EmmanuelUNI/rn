import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppHeader from '@/src/components/AppHeader';
import { COLORS, CRITERIA } from '@/src/config/constants';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { EvaluationGrades } from '../../domain/entities/Evaluation';
import { Group } from '../../domain/entities/Group';
import { useCourses } from '../context/courseContext';
import type { RootStackParamList } from '@/src/AuthFlow';

type NavProp       = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'GradeGroup'>;

export default function GradeGroupScreen() {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropType>();
  const { activity } = route.params;

  // FIX: also destructure getMySubmittedGrades so we can load saved grades from
  // the server when the user has already evaluated (matching Flutter's loadMyGrades).
  const {
    getMyGroupInActivity,
    hasEvaluated,
    submitEvaluation,
    getMySubmittedGrades,
  } = useCourses();

  const prefs = LocalPreferencesAsyncStorage.getInstance();

  const [group, setGroup]         = useState<Group | null>(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEvalMode, setIsEvalMode] = useState(false);
  // grades holds both: user's in-progress input AND server-loaded submitted grades.
  const [grades, setGrades]       = useState<EvaluationGrades>({});
  const [error, setError]         = useState('');

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      setLoading(true);
      const userId = await prefs.retrieveData<string>('userId');
      if (!userId) throw new Error('Usuario no encontrado');

      const grp = await getMyGroupInActivity(activity._id, userId);
      setGroup(grp);

      if (grp) {
        const alreadyEval = await hasEvaluated(activity._id, userId);
        const now         = new Date();
        const isActive    =
          now > new Date(activity.start_date) && now < new Date(activity.end_date);

        if (!alreadyEval && isActive) {
          // Evaluation window is open and user hasn't submitted yet → edit mode.
          setIsEvalMode(true);
        } else {
          // FIX: user already evaluated (or window closed) → load saved grades from
          // server so the static view shows real values instead of "–".
          // Flutter calls loadMyGrades() exactly here in the EvaluationController.
          try {
            const submitted = await getMySubmittedGrades(activity._id, userId);
            setGrades(submitted);
          } catch {
            // Non-fatal: grades will default to showing "–"
          }
          setIsEvalMode(false);
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar grupo');
    } finally {
      setLoading(false);
    }
  }

  function setGrade(memberId: string, criterion: string, value: string) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) return;
    setGrades(prev => ({
      ...prev,
      [memberId]: { ...(prev[memberId] ?? {}), [criterion]: parsed },
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const userId = await prefs.retrieveData<string>('userId');
      if (!userId || !group) throw new Error('Datos insuficientes');

      await submitEvaluation(activity._id, group._id, userId, grades);

      // FIX: after a successful submit, fetch the persisted grades from the server
      // so the static display reflects what was actually saved — matching Flutter's
      // behaviour of assigning mySubmittedGrades from the submit payload and then
      // switching to result mode.
      try {
        const submitted = await getMySubmittedGrades(activity._id, userId);
        setGrades(submitted);
      } catch {
        // Fallback: keep local grades state (still better than all "–")
      }

      setIsEvalMode(false);
      Alert.alert('Éxito', 'Evaluación enviada correctamente');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar la evaluación');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={activity.name} />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !group ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No perteneces a ningún grupo en esta actividad
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {group.members.map(member => (
              <View key={member.userId} style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <Text style={styles.memberName}>{member.name}</Text>
                </View>

                {CRITERIA.map((criterion, idx) => (
                  <View
                    key={criterion}
                    style={[
                      styles.criterionRow,
                      idx === CRITERIA.length - 1 && { borderBottomWidth: 0 },
                    ]}>
                    <View style={styles.criterionLabel}>
                      <Text style={styles.criterionText}>{criterion}</Text>
                    </View>
                    <View style={styles.criterionInput}>
                      {isEvalMode ? (
                        <TextInput
                          style={styles.gradeInput}
                          keyboardType="decimal-pad"
                          placeholder="1.0"
                          placeholderTextColor="#aaa"
                          maxLength={3}
                          onChangeText={val =>
                            setGrade(member.userId, criterion, val)
                          }
                        />
                      ) : (
                        // FIX: grades now contains server-loaded values when user
                        // already evaluated, so this will show real scores not "–".
                        <Text style={styles.gradeStatic}>
                          {grades[member.userId]?.[criterion] != null
                            ? (grades[member.userId][criterion] as number).toFixed(1)
                            : '–'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.buttonRow}>
              {isEvalMode && (
                <TouchableOpacity
                  style={styles.btn}
                  onPress={handleSubmit}
                  disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    // FIX: correct Spanish accent on "ó" — "Enviar evaluación"
                    <Text style={styles.btnText}>Enviar evaluación</Text>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate('Results', { activity })}>
                <Text style={styles.btnText}>Ver resultado</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:       { flex: 1, backgroundColor: COLORS.primary },
  content:        {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
  },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:      { color: '#666', fontSize: 14, textAlign: 'center' },
  errorText:      { color: '#e74c3c', fontSize: 14 },
  scroll:         { paddingBottom: 20 },
  memberCard:     {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8ADD0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  memberHeader:   { backgroundColor: COLORS.accentLight, paddingHorizontal: 10, paddingVertical: 8 },
  memberName:     { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  criterionRow:   { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#D3CBE3' },
  criterionLabel: {
    flex: 2,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#D3CBE3',
    justifyContent: 'center',
  },
  criterionText:  { color: '#7A7090', fontSize: 11 },
  criterionInput: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  gradeInput:     {
    textAlign: 'center',
    color: COLORS.primary,
    fontSize: 12,
    padding: 4,
    width: '100%',
  },
  gradeStatic:    { color: COLORS.primary, fontSize: 12 },
  buttonRow:      {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  btn:            {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  btnText:        { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});