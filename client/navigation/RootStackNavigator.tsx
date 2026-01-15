import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainTabNavigator from '@/navigation/MainTabNavigator';
import AddTaskScreen from '@/screens/AddTaskScreen';
import TaskDetailScreen from '@/screens/TaskDetailScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Task } from '@/types/task';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddTask: undefined;
  TaskDetail: { task: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem('@devtasks:onboarded');
        setInitialRoute(v === '1' ? 'Main' : 'Onboarding');
      } catch (err) {
        setInitialRoute('Main');
      }
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={screenOptions}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          presentation: 'modal',
          headerTitle: 'New Task',
        }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          headerTitle: 'Task Details',
        }}
      />
    </Stack.Navigator>
  );
}
