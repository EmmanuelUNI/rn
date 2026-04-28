// src/navigation/AppNavigator.js
import React from 'react';
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}