// src/screens/StudentGroupsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import CourseService from '../services/courseService';
import StorageService from '../services/storageService';
import { COLORS } from '../config/api';

function GroupDeliveryCard({ title, groupName, membersCount }) {
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

export default function StudentGroupsScreen({ route }) {
  const { course } = route.params;
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      const userId = await StorageService.get('userId');
      if (!userId) throw new Error('Usuario no encontrado');
      const data = await CourseService.getAllMyGroupsInCourse(course._id, userId);
      setGroups(data);
    } catch (e) {
      setError(e.message || 'Error al cargar grupos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Grupos" />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item, i) => `${item.groupName}-${i}`}
            renderItem={({ item }) => (
              <GroupDeliveryCard
                title={item.categoryName}
                groupName={item.groupName}
                membersCount={item.membersCount}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No tienes grupos asignados</Text>
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
  },
  listContent: { padding: 18 },
  center: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#999', fontSize: 15 },
  errorText: { color: '#e74c3c', fontSize: 15 },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#9B8CB9',
  },
  cardHeader: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardHeaderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardBody: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
  },
  cardCol: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  cardColText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  cardColTextCenter: {
    color: COLORS.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  cardDivider: {
    width: 1,
    backgroundColor: '#9B8CB9',
  },
});