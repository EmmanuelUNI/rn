import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import AppHeader from '@/src/components/AppHeader';
import { COLORS } from '@/src/config/constants';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { MyGroupSummary } from '../../domain/entities/Group';
import { useCourses } from '../context/courseContext';
import type { RootStackParamList } from '@/src/AuthFlow';

type RoutePropType = RouteProp<RootStackParamList, 'StudentGroups'>;

function GroupCard({ title, groupName, membersCount }: { title: string; groupName: string; membersCount: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardCol}>
          <Text style={styles.cardColText}>{groupName}</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardCol}>
          <Text style={styles.cardColTextCenter}>
            {membersCount}/{membersCount} (Completo)
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function StudentGroupsScreen() {
  const route = useRoute<RoutePropType>();
  const { course } = route.params;
  const { getAllMyGroupsInCourse } = useCourses();
  const prefs = LocalPreferencesAsyncStorage.getInstance();
  const [groups, setGroups] = useState<MyGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadGroups(); }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      const userId = await prefs.retrieveData<string>('userId');
      if (!userId) throw new Error('Usuario no encontrado');
      const data = await getAllMyGroupsInCourse(course._id, userId);
      setGroups(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Grupos" />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item, i) => `${item.groupName}-${i}`}
            renderItem={({ item }) => (
              <GroupCard title={item.categoryName} groupName={item.groupName} membersCount={item.membersCount} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}><Text style={styles.emptyText}>No tienes grupos asignados</Text></View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:          { flex: 1, backgroundColor: COLORS.primary },
  content:           { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  listContent:       { padding: 18 },
  center:            { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText:         { color: '#999', fontSize: 15 },
  errorText:         { color: '#e74c3c', fontSize: 15 },
  card:              { borderRadius: 10, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#9B8CB9' },
  cardHeader:        { backgroundColor: COLORS.accentLight, paddingHorizontal: 10, paddingVertical: 8 },
  cardHeaderText:    { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  cardBody:          { flexDirection: 'row', backgroundColor: '#F8F8F8' },
  cardCol:           { flex: 1, paddingHorizontal: 12, paddingVertical: 14 },
  cardColText:       { color: COLORS.primary, fontSize: 12 },
  cardColTextCenter: { color: COLORS.primary, fontSize: 12, textAlign: 'center' },
  cardDivider:       { width: 1, backgroundColor: '#9B8CB9' },
});