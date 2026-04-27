import { Link, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
      Keyboard,
      KeyboardAvoidingView,
      Platform,
      StyleSheet,
      View,
      ScrollView,
} from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "@/utils/SecureStore";

export default function Page() {
      const [isSignUp, setIsSignUp] = useState<boolean>(true);
      const [email, setEmail] = useState<string>("");
      const [name, setName] = useState<string>("");
      const [password, setPassword] = useState<string>("");
      const [error, setError] = useState<string | null>("");
      const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
      const router = useRouter();
      const theme = useTheme();

      useEffect(() => {
            const showSub = Keyboard.addListener("keyboardDidShow", () => {
                  setIsKeyboardVisible(true);
            });
            const hideSub = Keyboard.addListener("keyboardDidHide", () => {
                  setIsKeyboardVisible(false);
            });

            return () => {
                  showSub.remove();
                  hideSub.remove();
            };
      }, []);

      async function handleResponse(response: any): Promise<string | null> {
            if (response.access_token) {
                  await save("token", response.access_token);
                  await save("userName", response.user.name);
                  await save("user", JSON.stringify(response.user));
                  return null;
            }

            if (response["password"] != null) {
                  const err = Array.isArray(response["password"])
                        ? response["password"][0]
                        : response["password"];
                  return err;
            } else if (response["email"] != null) {
                  const err = Array.isArray(response["email"])
                        ? response["email"][0]
                        : response["email"];
                  return err;
            } else if (response["name"] != null) {
                  const err = Array.isArray(response["name"])
                        ? response["name"][0]
                        : response["name"];
                  return err;
            }

            return "Authentication failed.";
      }

      async function signUp(name: string, email: string, password: string) {
            try {
                  const response = await fetch(
                        process.env.EXPO_PUBLIC_API_URL + "/register",
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ name, email, password }),
                        },
                  );
                  const json = await response.json();
                  if (json["error"] != null) {
                        return typeof json["error"] === 'string' ? json["error"] : (json["error"].message || Object.values(json["error"]).flat()[0] || JSON.stringify(json["error"]));
                  }
                  const authError = await handleResponse(json);
                  return authError;
            } catch (error) {
                  return "Failed to sign up";
            }
      }

      // Izmantojot expo saglaba lietotne "token"
      async function save(key, value) {
            await SecureStore.setItemAsync(key, value);
      }

      // aisūta datus uz aizmugursistēmu
      async function signIn(email: string, password: string) {
            // meiģina aizmugursistēmu un saglaba "token"
            try {
                  // aisūta datus uz aizmugursistēmu
                  const response = await fetch(
                        process.env.EXPO_PUBLIC_API_URL + "/login",
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ email, password }),
                        },
                  );
                  // partaisa aizmugursistēmu atbilde uz "Object"
                  const json = await response.json();

                  // pārbauda vai nav kļūda no aizmugursistēmu
                  if (json["error"] != null) {
                        return typeof json["error"] === 'string' ? json["error"] : (json["error"].message || Object.values(json["error"]).flat()[0] || JSON.stringify(json["error"]));
                  }
                  // saglaba atbildi aizmugursistēmu
                  const authError = await handleResponse(json);
                  return authError;
            } catch (error) {
                  return "Failed to sign in";
            }
      }

      // pārbauda vai nav kļūda un aisuta request pareizaja vieta
      const handleAuth = async () => {
            // pārbauda vai e-pasts vai parole ir tukša
            if (!email || !password) {
                  setError("Please fill in all fields.");
                  return;
            }

            // pārbauda vai vards nav tukš
            if (isSignUp && !name) {
                  setError("Please fill in all fields.");
                  return;
            }

            // pārbauda vai parole atbilst drošības prasībām
            const passwordRegex =
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
            if (isSignUp && !passwordRegex.test(password)) {
                  setError(
                        "Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 special character.",
                  );
                  return;
            } else if (!isSignUp && password.length < 8) {
                  setError("Passwords must be at least 8 characters long.");
                  return;
            }

            // izdzēš iepriekšējo kļūdu
            setError(null);

            // saglaba kļudu no aizmugursistēmu
            let authError;
            if (isSignUp) {
                  authError = await signUp(name, email, password);
            } else {
                  authError = await signIn(email, password);
            }

            // lietotājam izvada kļūdu
            if (authError) {
                  setError(authError);
                  return;
            }

            // ja veiksmigi aizved lietotāju uz "home" skatu
            router.replace("/");
      };

      const handleSwitchMode = () => {
            setIsSignUp((prev) => !prev);
      };

      return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                  <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                        style={styles.container}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                  >
                        <ScrollView
                              contentContainerStyle={styles.scrollContent}
                              keyboardShouldPersistTaps="handled"
                        >
                              <View
                                    style={[
                                          styles.content,
                                          {
                                                backgroundColor:
                                                      theme.colors.background,
                                                justifyContent: isKeyboardVisible
                                                      ? "flex-start"
                                                      : "center",
                                          },
                                    ]}
                              >
                                    <View
                                          style={[
                                                styles.titleContainer,
                                                {
                                                      flexDirection: "column",
                                                      justifyContent:
                                                            "flex-end",
                                                },
                                          ]}
                                    >
                                          <Text
                                                style={[
                                                      styles.title,
                                                      {
                                                            color: theme.colors
                                                                  .primary,
                                                            fontWeight: "bold",
                                                            fontSize: 32,
                                                            marginTop: 20,
                                                      },
                                                ]}
                                          >
                                                WhatGame?
                                          </Text>
                                    </View>
                                    <Text
                                          style={styles.title}
                                          variant="headlineMedium"
                                    >
                                          {" "}
                                          {isSignUp
                                                ? "Create Account"
                                                : "Welcome Back"}
                                    </Text>

                                    {isSignUp && (
                                          <TextInput
                                                label="Name"
                                                autoCapitalize="none"
                                                mode="outlined"
                                                style={styles.input}
                                                onChangeText={setName}
                                          />
                                    )}

                                    <TextInput
                                          label="Email"
                                          autoCapitalize="none"
                                          keyboardType="email-address"
                                          placeholder="example@gmail.com"
                                          mode="outlined"
                                          style={styles.input}
                                          onChangeText={setEmail}
                                    />

                                    <TextInput
                                          label="Password"
                                          autoCapitalize="none"
                                          mode="outlined"
                                          secureTextEntry
                                          style={styles.input}
                                          onChangeText={setPassword}
                                    />

                                    {error && (
                                          <Text
                                                style={{
                                                      color: theme.colors.error,
                                                }}
                                          >
                                                {" "}
                                                {error}
                                          </Text>
                                    )}

                                    <Button
                                          mode="contained"
                                          style={styles.button}
                                          onPress={handleAuth}
                                    >
                                          {isSignUp ? "Sign Up" : "Sign In"}
                                    </Button>

                                    <Button
                                          mode="text"
                                          onPress={handleSwitchMode}
                                          style={styles.switchModeButton}
                                    >
                                          {isSignUp
                                                ? "Already have an account? Sign In"
                                                : "Don't have an account? Sign Up"}
                                    </Button>
                              </View>
                        </ScrollView>
                  </KeyboardAvoidingView>
            </View>
      );
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
      },
      scrollContent: {
            flexGrow: 1,
            justifyContent: "center",
            minHeight: "100%",
      },
      titleContainer: {
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 48,
      },
      content: {
            flex: 1,
            padding: 16,
            justifyContent: "center",
      },
      title: {
            textAlign: "center",
            marginBottom: 24,
      },
      input: {
            marginBottom: 16,
      },
      button: {
            marginTop: 8,
      },
      switchModeButton: {
            marginTop: 16,
      },
});
