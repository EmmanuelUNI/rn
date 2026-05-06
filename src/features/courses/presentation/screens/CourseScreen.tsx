import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppHeader from '@/src/components/AppHeader';
import { COLORS } from '@/src/config/constants';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { Activity } from '../../domain/entities/Activity';
import { useCourses } from '../context/courseContext';
import type { RootStackParamList } from '@/src/AuthFlow';

type NavProp   = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'Course'>;

function formatDateEs(dateStr: string): string {
  const date   = new Date(dateStr);
  const days   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const h12    = date.getHours() % 12 || 12;
  const mm     = String(date.getMinutes()).padStart(2, '0');
  const ampm   = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${days[date.getDay()].charAt(0).toUpperCase() + days[date.getDay()].slice(1)}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()} - ${h12}:${mm} ${ampm}`;
}

export default function CourseScreen() {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RoutePropType>();
  const { course } = route.params;
  const { isTeacher } = useAuth();
  const { getActivitiesByCourse } = useCourses();

  const [available, setAvailable] = useState<Activity[]>([]);
  const [expired, setExpired] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);

  useFocusEffect(
    useCallback(() => { loadActivities(); }, []),
  );

  async function loadActivities() {
    try {
      setLoading(true);
      const data = await getActivitiesByCourse(course._id);
      const now  = new Date();
      setAvailable(data.filter(a => new Date(a.end_date) > now));
      setExpired(data.filter(a => new Date(a.end_date) <= now));
    } catch {
      setAvailable([]); setExpired([]);
    } finally {
      setLoading(false);
    }
  }

  function openActivity(activity: Activity) {
    if (isTeacher) navigation.navigate('Groups', { activity, course });
    else navigation.navigate('GradeGroup', { activity, course });
  }

  const shownActivities = showAvailable ? available : expired;

  const renderActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity style={styles.activityCard} onPress={() => openActivity(item)} activeOpacity={0.8}>
      <Text style={styles.activityName}>{item.name}</Text>
      <Text style={styles.activityDate}>{formatDateEs(item.end_date)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={course.name} />
      <View style={styles.content}>
        {isTeacher && (
          <TouchableOpacity style={styles.importBtn}>
            <Text style={styles.importBtnText}>Importar Grupos</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.sectionTitle}>Evaluaciones</Text>
        <View style={styles.tabs}>
          {(['Disponibles', 'Finalizadas'] as const).map((label, idx) => {
            const active = idx === 0 ? showAvailable : !showAvailable;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setShowAvailable(idx === 0)}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        ) : (
          <FlatList
            data={shownActivities}
            keyExtractor={item => item._id}
            renderItem={renderActivity}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}><Text style={styles.emptyText}>No hay actividades aún</Text></View>
            }
          />
        )}

        {isTeacher ? (
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('GeneralResults', { course })}>
              <Text style={styles.bottomBtnText}>Ver resultados generales</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('CreateEvaluation', { course })}>
              <Text style={styles.bottomBtnText}>Crear evaluación</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bottomRight}>
            <TouchableOpacity style={styles.bottomBtn} onPress={() => navigation.navigate('StudentGroups', { course })}>
              <Text style={styles.bottomBtnText}>Tus grupos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: COLORS.primary },
  content:       { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 18 },
  sectionTitle:  { color: COLORS.primary, fontSize: 22, fontWeight: 'bold', paddingHorizontal: 18, marginBottom: 12 },
  importBtn:     { alignSelf: 'flex-start', backgroundColor: COLORS.primary, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, marginHorizontal: 18, marginBottom: 14 },
  importBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  tabs:          { flexDirection: 'row', paddingHorizontal: 18, marginBottom: 20, gap: 15 },
  tab:           { flex: 1, borderRadius: 24, borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 10, alignItems: 'center' },
  tabActive:     { backgroundColor: COLORS.primary },
  tabText:       { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },
  listContent:   { paddingHorizontal: 18, paddingBottom: 80 },
  activityCard:  { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 2, borderColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 18, minHeight: 72, justifyContent: 'center' },
  activityName:  { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  activityDate:  { color: '#666', fontSize: 12 },
  center:        { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText:     { color: '#999', fontSize: 15 },
  bottomRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 18, gap: 10 },
  bottomRight:   { alignItems: 'flex-end', paddingHorizontal: 18, paddingBottom: 18 },
  bottomBtn:     { backgroundColor: COLORS.primary, borderRadius: 24, paddingVertical: 14, paddingHorizontal: 16 },
  bottomBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
});