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
import AppHeader from '@/src/components/AppHeader';
import { COLORS } from '@/src/config/constants';
import { useCourses } from '../context/courseContext';
import { Group } from '../../domain/entities/Group';
import type { RootStackParamList } from '@/src/AuthFlow';

type RoutePropType = RouteProp<RootStackParamList, 'Groups'>;

function capitalizeWords(text: string): string {
  if (!text) return text;
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function GroupsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { activity } = route.params;
  const { getGroupsByActivity, getGlobalAverage } = useCourses();

  const [groups, setGroups] = useState<Group[]>([]);
  const [globalAverage, setGlobalAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAvg, setLoadingAvg] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [activity._id])
  );

  async function loadData() {
    try {
      setLoading(true);
      const data = await getGroupsByActivity(activity._id);
      setGroups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }

    try {
      setLoadingAvg(true);
      const avg = await getGlobalAverage(activity._id);
      setGlobalAverage(avg);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAvg(false);
    }
  }

  const renderGroup = ({ item }: { item: Group }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupNumberContainer}>
        <Text style={styles.groupNumber}>{item.name}</Text>
      </View>
      <View style={styles.membersContainer}>
        <Text style={styles.membersText}>
          {item.members.map(m => capitalizeWords(m.name)).join('\n')}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title={activity.name} />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Grupos</Text>
        
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={item => item._id}
            renderItem={renderGroup}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No hay grupos aún</Text>
              </View>
            }
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Media de la evaluación</Text>
          <View style={styles.avgCard}>
            <View style={styles.avgBadge}>
              {loadingAvg ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.avgValue}>{globalAverage.toFixed(1)}</Text>
              )}
            </View>
            <Text style={styles.avgLabel}>Promedio de todas</Text>
            <Text style={styles.avgLabel}>las evaluaciones</Text>
          </View>
        </View>
      </View>
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
    paddingTop: 30,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 40,
    marginBottom: 5,
  },
  listContent: { paddingHorizontal: 30, paddingBottom: 20 },
  groupCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#7C6A9F',
    marginBottom: 20,
    overflow: 'hidden',
    minHeight: 100,
  },
  groupNumberContainer: {
    backgroundColor: '#7C6A9F',
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNumber: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  membersContainer: { flex: 1, padding: 16, justifyContent: 'center' },
  membersText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  footer: { paddingBottom: 40, alignItems: 'center' },
  footerTitle: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  avgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#7C6A9F',
    width: '65%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  avgBadge: {
    backgroundColor: '#7C6A9F',
    width: 80,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avgValue: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  avgLabel: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});
