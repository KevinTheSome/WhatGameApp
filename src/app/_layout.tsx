import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useEffect } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { Colors } from "../../constants/Colors";
import { AuthProvider } from "../contexts/AuthContext";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { ThemeProvider, useThemeContext } from "../contexts/ThemeContext";

// This component wraps the app with the auth provider
function RootLayoutNav() {
      const { effectiveColorScheme, colorTheme, customColorRgb } = useThemeContext();

      // This will handle redirecting the user based on auth state
      useProtectedRoute();

      const basePresetName = colorTheme === 'custom' ? 'teal' : colorTheme;
      const baseColors = Colors[basePresetName] || Colors['teal'];
      
      const customColors = colorTheme === 'custom'
            ? {
                  light: { ...baseColors.light, primary: customColorRgb, primaryContainer: customColorRgb },
                  dark: { ...baseColors.dark, primary: customColorRgb, primaryContainer: customColorRgb }
            }
            : baseColors;

      const theme =
            effectiveColorScheme === "dark"
                  ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...customColors.dark } }
                  : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...customColors.light } };

      return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                  <PaperProvider theme={theme}>
                        <Stack
                              screenOptions={{
                                    headerStyle: {
                                          backgroundColor:
                                                theme.colors.primaryContainer,
                                    },
                                    headerTintColor:
                                          theme.colors.onPrimaryContainer,
                                    headerTitleStyle: {
                                          fontWeight: "bold",
                                    },
                              }}
                        >
                              <Stack.Screen
                                    name="(tabs)"
                                    options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                    name="auth"
                                    options={{ headerShown: false }}
                              />
                              <Stack.Screen
                                    name="index"
                                    options={{ headerShown: false }}
                              />
                        </Stack>
                  </PaperProvider>
            </GestureHandlerRootView>
      );
}

export default function RootLayout() {
      return (
            <ThemeProvider>
                  <AuthProvider>
                        <RootLayoutNav />
                  </AuthProvider>
            </ThemeProvider>
      );
}
