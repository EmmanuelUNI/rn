import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { List } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import AppHeader from '@/src/components/AppHeader';
import { COLORS } from '@/src/config/constants';
import { StudentAverage, GroupActivityAverage } from '../../domain/entities/Evaluation';
import { useCourses } from '../context/courseContext';
import type { RootStackParamList } from '@/src/AuthFlow';

type RoutePropType = RouteProp<RootStackParamList, 'GeneralResults'>;

function capitalizeWords(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function GeneralResultsScreen() {
  const route = useRoute<RoutePropType>();
  const { course } = route.params;
  const { getCourseGlobalAverages, getGroupsGlobalAverage } = useCourses();

  const [loading, setLoading] = useState(true);
  const [showStudents, setShowStudents] = useState(true);
  const [students, setStudents] = useState<StudentAverage[]>([]);
  const [groupResults, setGroupResults] = useState<GroupActivityAverage[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [studentData, groupData] = await Promise.all([
        getCourseGlobalAverages(course._id),
        getGroupsGlobalAverage(course._id),
      ]);
      setStudents(studentData);
      setGroupResults(groupData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const renderStudent = ({ item }: { item: StudentAverage }) => (
    <View style={styles.studentCard}>
      <Text style={styles.studentName} numberOfLines={1}>
        {capitalizeWords(item.studentName)}
      </Text>
      <View style={styles.averageBadge}>
        <Text style={styles.averageText}>{item.average.toFixed(1)}</Text>
      </View>
    </View>
  );

  const renderGroupActivity = ({ item }: { item: GroupActivityAverage }) => (
    <View style={styles.accordionContainer}>
      <List.Accordion
        title={item.activityName}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
        left={props => <List.Icon {...props} icon="folder-outline" color={COLORS.primary} />}
        theme={{ colors: { background: 'transparent' } }}
      >
        {item.groups.map((g) => (
          <List.Item
            key={g.groupId}
            title={g.groupName}
            titleStyle={styles.listItemTitle}
            right={() => (
              <Text style={styles.groupAvg}>
                {g.average !== null ? g.average.toFixed(1) : '--'}
              </Text>
            )}
            style={styles.listItem}
          />
        ))}
      </List.Accordion>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Resultados Generales" />
      <View style={styles.content}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setShowStudents(true)}
          >
            <Text style={[styles.tabText, showStudents && styles.tabTextActive]}>
              Estudiantes
            </Text>
          </TouchableOpacity>
          <Text style={styles.tabSeparator}>|</Text>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setShowStudents(false)}
          >
            <Text style={[styles.tabText, !showStudents && styles.tabTextActive]}>
              Grupos
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={showStudents ? students : groupResults}
            keyExtractor={(item, index) => (showStudents ? (item as StudentAverage).studentId : `act-${index}`)}
            renderItem={showStudents ? (renderStudent as any) : (renderGroupActivity as any)}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No hay datos disponibles</Text>
              </View>
            }
          />
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 15,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabText: {
    color: 'grey',
    fontWeight: 'bold',
    fontSize: 18,
  },
  tabTextActive: { color: COLORS.primary },
  tabSeparator: {
    color: 'grey',
    fontWeight: 'bold',
    fontSize: 18,
  },
  listContent: { paddingHorizontal: 18, paddingBottom: 20 },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
    overflow: 'hidden',
    paddingLeft: 14,
  },
  studentName: { flex: 1, fontWeight: '600', fontSize: 16, color: '#333' },
  averageBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 60,
    alignItems: 'center',
  },
  averageText: { color: '#FFFFFF', fontWeight: 'bold' },
  accordionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    // Elevation for Android
    elevation: 3,
    // Shadow for iOS
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden', // Ensures shadow doesn't create strange borders
  },
  accordion: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  accordionTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  listItem: { paddingLeft: 12, backgroundColor: '#FFFFFF' },
  listItemTitle: { fontSize: 14, color: '#444' },
  groupAvg: { alignSelf: 'center', marginRight: 15, fontWeight: 'bold', color: '#666', fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 },
});
