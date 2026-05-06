import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { useAuth } from './features/auth/presentation/context/authContext';
import LoginScreen from './features/auth/presentation/screens/LoginScreen';
import RegisterScreen from './features/auth/presentation/screens/RegisterScreen';
import VerificationScreen from './features/auth/presentation/screens/VerificationScreen';
import { CourseProvider } from './features/courses/presentation/context/courseContext';
import CourseScreen from './features/courses/presentation/screens/CourseScreen';
import CreateCourseScreen from './features/courses/presentation/screens/CreateCourseScreen';
import GradeGroupScreen from './features/courses/presentation/screens/GradeGroupScreen';
import HomeScreen from './features/courses/presentation/screens/HomeScreen';
import StudentGroupsScreen from './features/courses/presentation/screens/StudentGroupsScreen';
import PlaceholderScreen from './components/PlaceholderScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Verification: undefined;
  Home: undefined;
  Course: { course: import('./features/courses/domain/entities/Course').Course };
  CreateCourse: undefined;
  StudentGroups: { course: import('./features/courses/domain/entities/Course').Course };
  GradeGroup: {
    activity: import('./features/courses/domain/entities/Activity').Activity;
    course: import('./features/courses/domain/entities/Course').Course;
  };
  Groups: {
    activity: import('./features/courses/domain/entities/Activity').Activity;
    course: import('./features/courses/domain/entities/Course').Course;
  };
  GeneralResults: { course: import('./features/courses/domain/entities/Course').Course };
  CreateEvaluation: { course: import('./features/courses/domain/entities/Course').Course };
  Results: { activity: import('./features/courses/domain/entities/Activity').Activity };
};

const Stack = createStackNavigator<RootStackParamList>();

function AuthenticatedStack() {
  return (
    <CourseProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Course" component={CourseScreen} />
        <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
        <Stack.Screen name="StudentGroups" component={StudentGroupsScreen} />
        <Stack.Screen name="GradeGroup" component={GradeGroupScreen} />
        <Stack.Screen name="Groups" component={PlaceholderScreen} />
        <Stack.Screen name="GeneralResults" component={PlaceholderScreen} />
        <Stack.Screen name="CreateEvaluation" component={PlaceholderScreen} />
        <Stack.Screen name="Results" component={PlaceholderScreen} />
      </Stack.Navigator>
    </CourseProvider>
  );
}

export default function AuthFlow() {
  const { isLogged, isSigningUp, isValidating } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLogged ? (
        <Stack.Screen name="Home" component={AuthenticatedStack} />
      ) : isValidating ? (
        <Stack.Screen name="Verification" component={VerificationScreen} />
      ) : isSigningUp ? (
        <Stack.Screen name="Register" component={RegisterScreen} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}