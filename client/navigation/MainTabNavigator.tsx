import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TasksStackNavigator from '@/navigation/TasksStackNavigator';
import SettingsStackNavigator from '@/navigation/SettingsStackNavigator';
import { useTheme } from '@/hooks/useTheme';

export type MainTabParamList = {
  TasksTab: undefined;
  SettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="TasksTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'android' ? 6 : 2,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: (insets.bottom || 0) + 12,
          height: 64 + (insets.bottom || 0),
          backgroundColor: Platform.select({
            ios: 'transparent',
            android: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
          }),
          borderTopWidth: 0,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <View style={StyleSheet.absoluteFill}>
              <BlurView
                intensity={100}
                tint={isDark ? 'dark' : 'light'}
                style={[StyleSheet.absoluteFill, { borderRadius: 999 }]}
              />
              <View
                style={[
                  StyleSheet.absoluteFill,
                  { borderRadius: 999, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.55)' },
                ]}
              />
            </View>
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TasksTab"
        component={TasksStackNavigator}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
