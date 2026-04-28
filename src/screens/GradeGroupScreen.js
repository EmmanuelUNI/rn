// src/screens/GradeGroupScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import CourseService from '../services/courseService';
import StorageService from '../services/storageService';
import { DB_URL, COLORS } from '../config/api';

const CRITERIA = ['Puntualidad', 'Aportes', 'Compromiso', 'Actitud'];

function generateId() {
  return Math.random().toString(36).substring(2, 14);
}

async function authHeader() {
  const token = await StorageService.get('token');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function hasEvaluated(activityId, evaluatorId) {
  const token = await StorageService.get('token');
  const res = await fetch(
    `${DB_URL}/read?tableName=evaluation&activity_id=${activityId}&evaluator_id=${evaluatorId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = await res.json();
  return data.length > 0;
}

async function submitEvaluation(activityId, groupId, evaluatorId, grades) {
  const headers = await authHeader();
  for (const [evaluatedId, scores] of Object.entries(grades)) {
    const evalId = generateId();
    await fetch(`${DB_URL}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tableName: 'evaluation',
        records: [{ _id: evalId, activity_id: activityId, group_id: groupId, evaluator_id: evaluatorId, evaluated_id: evaluatedId }],
      }),
    });
    const scoreRecords = Object.entries(scores).map(([criterion, score]) => ({
      evaluation_id: evalId,
      criterion,
      score,
    }));
    await fetch(`${DB_URL}/insert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tableName: 'evaluation_scores', records: scoreRecords }),
    });
  }
}

export default function GradeGroupScreen({ route, navigation }) {
  const { activity } = route.params;
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEvalMode, setIsEvalMode] = useState(false);
  const [grades, setGrades] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      setLoading(true);
      const userId = await StorageService.get('userId');
      const grp = await CourseService.getMyGroupInActivity(activity._id, userId);
      setGroup(grp);

      if (grp) {
        const alreadyEval = await hasEvaluated(activity._id, userId);
        const now = new Date();
        const isActive = now > new Date(activity.start_date) && now < new Date(activity.end_date);
        setIsEvalMode(!alreadyEval && isActive);
      }
    } catch (e) {
      setError(e.message || 'Error al cargar grupo');
    } finally {
      setLoading(false);
    }
  }

  function setGrade(memberId, criterion, value) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 1 || parsed > 5) return;
    setGrades(prev => ({
      ...prev,
      [memberId]: { ...(prev[memberId] || {}), [criterion]: parsed },
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const userId = await StorageService.get('userId');
      await submitEvaluation(activity._id, group._id, userId, grades);
      setIsEvalMode(false);
      Alert.alert('Éxito', 'Evaluación enviada correctamente');
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo enviar la evaluación');
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
          <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
        ) : !group ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No perteneces a ningún grupo en esta categoría</Text>
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
                    style={[styles.criterionRow, idx === CRITERIA.length - 1 && { borderBottomWidth: 0 }]}>
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
                          onChangeText={val => setGrade(member.userId, criterion, val)}
                        />
                      ) : (
                        <Text style={styles.gradeStatic}>
                          {grades[member.userId]?.[criterion]?.toFixed(1) || '-'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.buttonRow}>
              {isEvalMode && (
                <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={submitting}>
                  {submitting
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={styles.btnText}>Enviar evaluacion</Text>
                  }
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
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666', fontSize: 14, textAlign: 'center' },
  errorText: { color: '#e74c3c', fontSize: 14 },
  scroll: { paddingBottom: 20 },
  memberCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8ADD0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  memberHeader: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  memberName: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  criterionRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D3CBE3',
  },
  criterionLabel: {
    flex: 2,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#D3CBE3',
    justifyContent: 'center',
  },
  criterionText: { color: '#7A7090', fontSize: 11 },
  criterionInput: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  gradeInput: { textAlign: 'center', color: COLORS.primary, fontSize: 12, padding: 4, width: '100%' },
  gradeStatic: { color: COLORS.primary, fontSize: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 12 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});