import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect, use } from "react";
import { useThemeContext } from "../../contexts/ThemeContext";
import {
      Button,
      Text,
      TextInput,
      useTheme,
      ActivityIndicator,
      Card,
      Avatar,
      Modal,
      Portal,
      SegmentedButtons,
      Icon,
} from "react-native-paper";
import { router } from "expo-router";
import * as SecureStore from "@/utils/SecureStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { useUserStatistics } from "@/hooks/useUserStatistics";

export default function Tab() {
      const [loading, setLoading] = useState(true);
      const [password, setPassword] = useState("");
      const [error, setError] = useState("");
      const [user, setUser] = useState(null);
      const [isEditModalVisible, setIsEditModalVisible] = useState(false);
      const [editedName, setEditedName] = useState("");
      const [editedEmail, setEditedEmail] = useState("");
      const [isProfilePictureModalVisible, setIsProfilePictureModalVisible] = useState(false);
      const [editedProfilePictureUrl, setEditedProfilePictureUrl] = useState("");
      const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
            useState(false);
      const [oldPassword, setOldPassword] = useState("");
      const [newPassword, setNewPassword] = useState("");
      const [confirmNewPassword, setConfirmNewPassword] = useState("");
      const [isCustomColorModalVisible, setIsCustomColorModalVisible] = useState(false);
      const [customRgbInput, setCustomRgbInput] = useState("");
      const insets = useSafeAreaInsets();
      const theme = useTheme();
      const navigation = useNavigation();

const { themePreference, setThemePreference, effectiveColorScheme, colorTheme, setColorTheme, customColorRgb, setCustomColorRgb } =
             useThemeContext();

      const { statistics, loading: statsLoading } = useUserStatistics();

      useEffect(() => {
            navigation.setOptions({ headerShown: false });
      }, [navigation]);

      useEffect(() => {}, []);

      async function getUser() {
            const userString = await SecureStore.getItemAsync("user");
            if (userString) {
                  const userData = JSON.parse(userString);
                  setUser(userData);
                  setEditedName(userData.name);
                  setEditedEmail(userData.email);
                  setEditedProfilePictureUrl(userData.profile_picture_url || "");
            }
            setLoading(false);
      }

      useEffect(() => {
            getUser();
      }, []);

      useEffect(() => {
            if (customColorRgb) {
                  setCustomRgbInput(customColorRgb);
            }
      }, [customColorRgb]);

      async function logout() {
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("user");
            router.replace("/auth");
      }

      async function delUser() {
            if (password === "") {
                  setError("Password is required");
                  return;
            }
            try {
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/delUser`,
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                              body: JSON.stringify({
                                    user_pass: password,
                              }),
                        },
                  );

                  const data = await response.json();

                  if (response.ok) {
                        setIsChangePasswordModalVisible(false);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                        setError("");
                        await SecureStore.deleteItemAsync("token");
                        await SecureStore.deleteItemAsync("user");
                        router.replace("/auth");
                  } else {
                        setError(
                              data.error ||
                                    "Failed to delete user, make sure you entered the correct password",
                        );
                  }
            } catch (error) {
                  setError("An unexpected error occurred.");
                  console.error(error);
            }
      }

      const handleChangePassword = async () => {
            if (newPassword !== confirmNewPassword) {
                  setError("Passwords do not match");
                  return;
            }

            try {
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/changePassword`,
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                              body: JSON.stringify({
                                    user_pass: oldPassword,
                                    new_pass: newPassword,
                                    new_pass_confirm: confirmNewPassword,
                              }),
                        },
                  );

                  const data = await response.json();

                  if (response.ok) {
                        setIsChangePasswordModalVisible(false);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmNewPassword("");
                        setError("");
                  } else {
                        setError(data.error || "Failed to change password");
                  }
            } catch (error) {
                  setError("An unexpected error occurred.");
                  console.error(error);
            }
      };

      const handleUpdateProfile = async () => {
            try {
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/updateUser`,
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                              body: JSON.stringify({
                                    name: editedName,
                                    email: editedEmail,
                              }),
                        },
                  );

                  const data = await response.json();

                  if (response.ok) {
                        await SecureStore.setItemAsync(
                              "user",
                              JSON.stringify(data.user),
                        );
                        setUser(data.user);
                        setIsEditModalVisible(false);
                  } else {
                        setError(data.message || "Failed to update profile");
                  }
            } catch (error) {
                  setError("An unexpected error occurred.");
                  console.error(error);
            }
      };

      const handleUpdateProfilePictureUrl = async () => {
            try {
                  const response = await fetch(
                        `${process.env.EXPO_PUBLIC_API_URL}/updateUser`,
                        {
                              method: "POST",
                              headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${await SecureStore.getItemAsync("token")}`,
                              },
                              body: JSON.stringify({
                                    profile_picture_url: editedProfilePictureUrl,
                              }),
                        },
                  );

                  const data = await response.json();

                  if (response.ok) {
                        await SecureStore.setItemAsync(
                              "user",
                              JSON.stringify(data.user),
                        );
                        setUser(data.user);
                        setIsProfilePictureModalVisible(false);
                  } else {
                        setError(data.message || "Failed to update profile picture");
                  }
            } catch (error) {
                  setError("An unexpected error occurred.");
                  console.error(error);
            }
      };

      if (loading) {
            return (
                  <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                  </View>
            );
      }

      return (
            <ScrollView
                  style={{
                        flex: 1,
                        backgroundColor: theme.colors.background,
                  }}
                  contentContainerStyle={{
                        padding: 16,
                        paddingTop: insets.top + 16,
                        paddingBottom: 80,
                  }}
            >
                  <Text
                        variant="headlineLarge"
                        style={[
                              styles.title,
                              { color: theme.colors.onBackground },
                        ]}
                  >
                        Settings
                  </Text>
                  <Card style={styles.card}>
                        <Card.Title
                              title="Account"
                              left={(props) => (
                                    <Avatar.Icon {...props} icon="account" />
                              )}
                        />
                        <Card.Content>
                              <Text>Username: {user?.name}</Text>
                              <Text>Email: {user?.email}</Text>
                              <Button
                                    onPress={() => setIsEditModalVisible(true)}
                              >
                                    <Text>Edit Profile</Text>
                              </Button>
                              <Button
                                    onPress={() =>
                                          setIsChangePasswordModalVisible(true)
                                    }
                              >
                                    <Text>Change Password</Text>
                              </Button>
                              <Button onPress={logout}><Text>Logout</Text></Button>
                        </Card.Content>
                  </Card>

                  <Card style={styles.card}>
                        <Card.Title
                              title="Statistics"
                              left={(props) => (
                                    <Avatar.Icon {...props} icon="chart-bar" />
                              )}
                        />
                        <Card.Content>
                              {statsLoading ? (
                                    <ActivityIndicator size="small" />
                              ) : statistics ? (
                                    <>
                                          <View style={styles.statRow}>
                                                <Icon source="calendar-clock" size={20} />
                                                <Text style={styles.statText}>
                                                      Account age: {statistics.account_age_in_days} days
                                                </Text>
                                          </View>
                                          <View style={styles.statRow}>
                                                <Icon source="account-group" size={20} />
                                                <Text style={styles.statText}>
                                                      Lobbies created: {statistics.lobbies_created}
                                                </Text>
                                          </View>
                                          <View style={styles.statRow}>
                                                <Icon source="account-multiple-plus" size={20} />
                                                <Text style={styles.statText}>
                                                      Lobbies joined: {statistics.lobbies_joined}
                                                </Text>
                                          </View>
                                          <View style={styles.statRow}>
                                                <Icon source="vote" size={20} />
                                                <Text style={styles.statText}>
                                                      Games voted on: {statistics.games_voted_on}
                                                </Text>
                                          </View>
                                          <View style={styles.statRow}>
                                                <Icon source="thumb-up" size={20} />
                                                <Text style={styles.statText}>
                                                      Most liked: {statistics.most_liked_game ? `${statistics.most_liked_game.name} (${statistics.most_liked_game.count} upvotes)` : "None"}
                                                </Text>
                                          </View>
                                          <View style={styles.statRow}>
                                                <Icon source="thumb-down" size={20} />
                                                <Text style={styles.statText}>
                                                      Most disliked: {statistics.most_disliked_game ? `${statistics.most_disliked_game.name} (${statistics.most_disliked_game.count} downvotes)` : "None"}
                                                </Text>
                                          </View>
                                    </>
                              ) : (
                                    <Text>Unable to load statistics</Text>
                              )}
                        </Card.Content>
                  </Card>

                  <Card style={styles.card}>
                        <Card.Title
                              title="Profile Picture"
                              left={(props) => (
                                    <Avatar.Icon {...props} icon="image" />
                              )}
                        />
                        <Card.Content>
                              {user?.profile_picture_url ? (
                                    <Avatar.Image
                                          key={user.profile_picture_url}
                                          size={100}
                                          source={{ uri: user.profile_picture_url }}
                                          style={{ alignSelf: "center", marginBottom: 16, backgroundColor: "transparent" }}
                                    />
                              ) : (
                                    <Avatar.Icon
                                          size={100}
                                          icon="account"
                                          style={{ alignSelf: "center", marginBottom: 16 }}
                                    />
                              )}
                              <Button
                                    onPress={() => setIsProfilePictureModalVisible(true)}
                              >
                                    <Text>Update Picture URL</Text>
                              </Button>
                        </Card.Content>
                  </Card>

                  <Card style={styles.card}>
                        <Card.Title
                              title="Appearance"
                              left={(props) => (
                                    <Avatar.Icon {...props} icon="palette" />
                              )}
                        />
                        <Card.Content>
                              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                                    System Theme
                              </Text>
                              <SegmentedButtons
                                    value={themePreference}
                                    onValueChange={(value) => setThemePreference(value as any)}
                                    buttons={[
                                          {
                                                value: "system",
                                                label: "System",
                                                icon: "theme-light-dark",
                                          },
                                          {
                                                value: "light",
                                                label: "Light",
                                                icon: "weather-sunny",
                                          },
                                          {
                                                value: "dark",
                                                label: "Dark",
                                                icon: "weather-night",
                                          },
                                    ]}
                                    style={{ marginBottom: 24 }}
                              />

                              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                                    Color Palette
                              </Text>
                              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                                    {[
                                          { value: "teal", color: "#006874", label: "Teal" },
                                          { value: "blue", color: "#005ac1", label: "Blue" },
                                          { value: "green", color: "#006d3a", label: "Green" },
                                          { value: "orange", color: "#984816", label: "Orange" },
                                          { value: "purple", color: "#6750a4", label: "Purple" },
                                          { value: "red", color: "#bb1614", label: "Red" },
                                    ].map((preset) => (
                                          <TouchableOpacity
                                                key={preset.value}
                                                onPress={() => setColorTheme(preset.value as any)}
                                                style={{
                                                      width: 50,
                                                      height: 50,
                                                      borderRadius: 25,
                                                      backgroundColor: preset.color,
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                      shadowColor: theme.colors.shadow,
                                                      shadowOffset: { width: 0, height: 2 },
                                                      shadowOpacity: 0.2,
                                                      shadowRadius: 2,
                                                      elevation: 3,
                                                }}
                                          >
                                                {colorTheme === preset.value && (
                                                      <Icon source="check" size={28} color="#ffffff" />
                                                )}
                                          </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                          onPress={() => {
                                                setColorTheme("custom");
                                                setIsCustomColorModalVisible(true);
                                          }}
                                          style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 25,
                                                backgroundColor: colorTheme === "custom" ? customColorRgb : theme.colors.surfaceVariant,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                borderWidth: colorTheme === "custom" ? 0 : 1,
                                                borderColor: theme.colors.outlineVariant,
                                                shadowColor: theme.colors.shadow,
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 2,
                                                elevation: 3,
                                          }}
                                    >
                                          {colorTheme === "custom" ? (
                                                <Icon source="palette-swatch" size={26} color="#ffffff" />
                                          ) : (
                                                <Icon source="palette-swatch" size={26} color={theme.colors.onSurfaceVariant} />
                                          )}
                                    </TouchableOpacity>
                              </View>
                        </Card.Content>
                  </Card>

                  <Card style={styles.card}>
                        <Card.Title
                              title="Danger Zone"
                              left={(props) => (
                                    <Avatar.Icon
                                          {...props}
                                          icon="alert-circle"
                                    />
                              )}
                        />
                        <Card.Content>
                              <TextInput
                                    label="Password"
                                    value={password}
                                    secureTextEntry
                                    onChangeText={setPassword}
                              />
                              {error ? (
                                    <Text
                                          style={[
                                                styles.errorText,
                                                { color: theme.colors.error },
                                          ]}
                                    >
                                          {error}
                                    </Text>
                              ) : null}
                              <Button onPress={delUser}><Text>Delete User</Text></Button>
                        </Card.Content>
                  </Card>

                  <Portal>
                        <Modal
                              visible={isEditModalVisible}
                              onDismiss={() => setIsEditModalVisible(false)}
                              contentContainerStyle={styles.modalContainer}
                        >
                              <Card>
                                    <Card.Title title="Edit Profile" />
                                    <Card.Content>
                                          <TextInput
                                                label="Name"
                                                value={editedName}
                                                onChangeText={setEditedName}
                                                style={styles.input}
                                          />
                                          <TextInput
                                                label="Email"
                                                value={editedEmail}
                                                onChangeText={setEditedEmail}
                                                style={styles.input}
                                          />
                                          <Button onPress={handleUpdateProfile}>
                                                <Text>Save</Text>
                                          </Button>
                                    </Card.Content>
                              </Card>
                        </Modal>
                  </Portal>

                  <Portal>
                        <Modal
                              visible={isProfilePictureModalVisible}
                              onDismiss={() => setIsProfilePictureModalVisible(false)}
                              contentContainerStyle={styles.modalContainer}
                        >
                              <Card>
                                    <Card.Title title="Edit Profile Picture" />
                                    <Card.Content>
                                          <TextInput
                                                label="Image URL"
                                                value={editedProfilePictureUrl}
                                                onChangeText={setEditedProfilePictureUrl}
                                                style={styles.input}
                                                placeholder="https://example.com/avatar.jpg"
                                          />
                                          <Button onPress={handleUpdateProfilePictureUrl}>
                                                <Text>Save</Text>
                                          </Button>
                                    </Card.Content>
                              </Card>
                        </Modal>
                  </Portal>

                  <Portal>
                        <Modal
                              visible={isChangePasswordModalVisible}
                              onDismiss={() =>
                                    setIsChangePasswordModalVisible(false)
                              }
                              contentContainerStyle={styles.modalContainer}
                        >
                              <Card>
                                    <Card.Title title="Change Password" />
                                    <Card.Content>
                                          <TextInput
                                                label="Old Password"
                                                value={oldPassword}
                                                onChangeText={setOldPassword}
                                                secureTextEntry
                                                style={styles.input}
                                          />
                                          <TextInput
                                                label="New Password"
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                secureTextEntry
                                                style={styles.input}
                                          />
                                          <TextInput
                                                label="Confirm New Password"
                                                value={confirmNewPassword}
                                                onChangeText={
                                                      setConfirmNewPassword
                                                }
                                                secureTextEntry
                                                style={styles.input}
                                          />
                                          <Button
                                                onPress={handleChangePassword}
                                          >
                                                <Text>Save</Text>
                                          </Button>
                                    </Card.Content>
                              </Card>
                        </Modal>
                  </Portal>

                  <Portal>
                        <Modal
                              visible={isCustomColorModalVisible}
                              onDismiss={() => setIsCustomColorModalVisible(false)}
                              contentContainerStyle={styles.modalContainer}
                        >
                              <Card>
                                    <Card.Title title="Custom RGB Color" />
                                    <Card.Content>
                                          <TextInput
                                                label="Valid CSS Color (e.g. #ff0000 or rgb(255, 0, 0))"
                                                value={customRgbInput}
                                                onChangeText={setCustomRgbInput}
                                                style={styles.input}
                                                autoCapitalize="none"
                                          />
                                          <Button onPress={() => {
                                                setCustomColorRgb(customRgbInput);
                                                setIsCustomColorModalVisible(false);
                                          }}>
                                                <Text>Save Custom Color</Text>
                                          </Button>
                                    </Card.Content>
                              </Card>
                        </Modal>
                  </Portal>
            </ScrollView>
      );
}

const styles = StyleSheet.create({
      container: {
            flex: 1,
      },
      title: {
            fontWeight: "bold",
            marginBottom: 16,
      },
      card: {
            marginBottom: 16,
      },
      loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
      },
      errorText: {
            marginTop: 8,
      },
      modalContainer: {
            padding: 20,
      },
      input: {
            marginBottom: 16,
      },
      statRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
      },
      statText: {
            marginLeft: 12,
            fontSize: 16,
      },
});
