// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import CourseService from '../services/courseService';
import { COLORS } from '../config/api';

export default function HomeScreen({ navigation }) {
  const { userName, isTeacher, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, []),
  );

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await CourseService.getCoursesByUser();

      // Enrich with active activities count
      const enriched = await Promise.all(
        data.map(async course => {
          const count = await CourseService.getActivitiesCountByCourse(course._id);
          return { ...course, activities: count };
        }),
      );
      setCourses(enriched);
    } catch (e) {
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadCourses();
  }

  function openCourse(course) {
    navigation.navigate('Course', { course });
  }

  function openCreateCourse() {
    navigation.navigate('CreateCourse');
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  }

  const renderCourse = ({ item }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => openCourse(item)}
      activeOpacity={0.8}>
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseActivities}>{item.activities ?? 0} actividades</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Purple header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Logout icon on left side (mirrored like Flutter) */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutIcon}>⇥</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <Image
            source={require('../../assets/logo_sin_fondo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>Hola, {userName}</Text>
      </View>

      {/* White content area */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tus cursos</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={courses}
            keyExtractor={item => item._id}
            renderItem={renderCourse}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No tienes cursos inscritos</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          />
        )}

        {isTeacher && (
          <TouchableOpacity style={styles.createBtn} onPress={openCreateCourse}>
            <Text style={styles.createBtnText}>+ Crear curso</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutBtn: { padding: 4, width: 40 },
  logoutIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  logo: { height: 50, width: 100 },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.accent,
    padding: 16,
    marginBottom: 18,
    justifyContent: 'center',
    minHeight: 72,
  },
  courseName: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseActivities: {
    color: '#555',
    fontSize: 13,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#999', fontSize: 15 },
  createBtn: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});