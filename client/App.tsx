import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from 'react';
import { AppState } from 'react-native';
import sync from '@/lib/sync';

export default function App() {
  useEffect(() => {
    // attempt to process any queued changes on startup
    sync.processQueue();
    sync.pullFromServer();

    const interval = setInterval(() => {
      sync.processQueue();
      sync.pullFromServer();
    }, 60 * 1000);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync.processQueue();
        sync.pullFromServer();
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <KeyboardProvider>
              <NavigationContainer>
                <RootStackNavigator />
              </NavigationContainer>
              <StatusBar style="auto" />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
