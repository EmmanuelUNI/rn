import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS } from '@/src/config/constants';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { useCourses } from '../context/courseContext';
import type { RootStackParamList } from '@/src/AuthFlow';
import { Course } from '../../domain/entities/Course';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { userName, isTeacher, logout } = useAuth();
  const { courses, isLoading, refreshCourses } = useCourses();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => { refreshCourses(); }, []),
  );

  function onRefresh() {
    setRefreshing(true);
    refreshCourses().finally(() => setRefreshing(false));
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  }

  const renderCourse = ({ item }: { item: Course & { activities: number } }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => navigation.navigate('Course', { course: item })}
      activeOpacity={0.8}>
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseActivities}>{item.activities ?? 0} actividades</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutIcon}>⇥</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <Image
            source={require('../../../../../assets/logo_sin_fondo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>Hola, {userName}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tus cursos</Text>

        {isLoading && !refreshing ? (
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
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateCourse')}>
            <Text style={styles.createBtnText}>+ Crear curso</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:     { flex: 1, backgroundColor: COLORS.primary },
  header:       { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 8 : 4, paddingBottom: 12 },
  headerRow:    { flexDirection: 'row', alignItems: 'center' },
  logoutBtn:    { padding: 4, width: 40 },
  logoutIcon:   { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  logo:         { height: 50, width: 100 },
  headerTitle:  { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  content:      { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 24 },
  sectionTitle: { color: COLORS.primary, fontSize: 24, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 10 },
  listContent:  { paddingHorizontal: 18, paddingBottom: 100 },
  courseCard:   { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 2, borderColor: COLORS.accent, padding: 16, marginBottom: 18, justifyContent: 'center', minHeight: 72 },
  courseName:   { color: COLORS.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  courseActivities: { color: '#555', fontSize: 13 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText:    { color: '#999', fontSize: 15 },
  createBtn:    { position: 'absolute', right: 18, bottom: 24, backgroundColor: COLORS.primary, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 14, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  createBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});