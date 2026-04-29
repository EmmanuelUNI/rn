// src/navigation/AppNavigator.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerificationScreen from '../screens/VerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import CourseScreen from '../screens/CourseScreen';
import CreateCourseScreen from '../screens/CreateCourseScreen';
import StudentGroupsScreen from '../screens/StudentGroupsScreen';
import GradeGroupScreen from '../screens/GradeGroupScreen';
import { COLORS } from '../config/api';

// Placeholder screens for features not yet implemented
function PlaceholderScreen({ route }) {
  const title = route?.name || 'Próximamente';
  return (
    <SafeAreaView style={placeholder.safe}>
      <View style={placeholder.container}>
        <Text style={placeholder.text}>{title}</Text>
        <Text style={placeholder.sub}>Esta pantalla está en desarrollo</Text>
      </View>
    </SafeAreaView>
  );
}

const placeholder = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  sub: { fontSize: 14, color: '#888', marginTop: 8 },
});

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLogged, isSigningUp, isValidating } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLogged ? (
          isValidating ? (
            <Stack.Screen name="Verification" component={VerificationScreen} />
          ) : isSigningUp ? (
            <Stack.Screen name="Register" component={RegisterScreen} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Course" component={CourseScreen} />
            <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
            <Stack.Screen name="StudentGroups" component={StudentGroupsScreen} />
            <Stack.Screen name="GradeGroup" component={GradeGroupScreen} />
            {/* Placeholder screens for features in development */}
            <Stack.Screen name="Groups" component={PlaceholderScreen} />
            <Stack.Screen name="GeneralResults" component={PlaceholderScreen} />
            <Stack.Screen name="CreateEvaluation" component={PlaceholderScreen} />
            <Stack.Screen name="Results" component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}