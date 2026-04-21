import { View, StyleSheet, Modal, Pressable, Image } from "react-native";
import { useEffect, useState } from "react";
import { Text, List, useTheme, Avatar } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SecureStore from "@/utils/SecureStore";

export default function FriendListItem(props: any) {
      const theme = useTheme();
      const [friend, setFriend] = useState(props.friend);
      const [userId, setUserId] = useState<number | null>(null);
      const [showPfpModal, setShowPfpModal] = useState(false);

      useEffect(() => {
            async function getUserId() {
                  const user = await SecureStore.getItemAsync("user");
                  if (user) {
                        setUserId(JSON.parse(user).id);
                  }
            }
            getUserId();
      }, []);

      const getFixedUrl = (url?: string) => {
            if (!url) return url;
            if (url.includes("localhost") || url.includes("127.0.0.1")) {
                  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(
                        /\/api$/,
                        "",
                  );
                  return url.replace(
                        /http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/,
                        baseUrl || "",
                  );
            }
            if (url.startsWith("/")) {
                  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(
                        /\/api$/,
                        "",
                  );
                  return `${baseUrl}${url}`;
            }
            return url;
      };

      const fixedUrl = getFixedUrl(friend.profile_picture_url);

      const renderAvatar = () => {
            if (fixedUrl) {
                  return (
                        <Pressable onPress={() => setShowPfpModal(true)}>
                              <Avatar.Image
                                    size={40}
                                    source={{ uri: fixedUrl }}
                                    style={{
                                          marginRight: 16,
                                          backgroundColor: "transparent",
                                    }}
                              />
                        </Pressable>
                  );
            }
            return (
                  <Avatar.Text
                        size={40}
                        label={friend.name.charAt(0).toUpperCase()}
                        style={{
                              marginRight: 16,
                              backgroundColor: "transparent",
                        }}
                        color={theme.colors.primary}
                  />
            );
      };

      const renderRightIcon = (type: string, isCurrentUser: boolean) => {
            if (type === "people" && isCurrentUser) return null;

            let iconName: keyof typeof Ionicons.glyphMap = "person-add";
            let onPress: () => void = () => {};

            if (type === "people") {
                  iconName = "person-add";
                  onPress = () => props.handleAddFriend(friend);
            } else if (type === "friends") {
                  iconName = "person-remove";
                  onPress = () => props.handleRemoveFriend(friend);
            } else if (type === "requests") {
                  if (friend.sender_id == userId) {
                        iconName = "person-remove";
                        onPress = () => props.handleRemoveFriend(friend);
                  } else {
                        iconName = "person-add";
                        onPress = () => props.handleAcceptFriend(friend);
                  }
            }

            return (
                  <Pressable onPress={onPress} hitSlop={8}>
                        <Ionicons
                              name={iconName}
                              size={24}
                              color={theme.colors.onSurface}
                        />
                  </Pressable>
            );
      };

      let listItemJSX = null;
      if (props.type === "people") {
            const isCurrentUser = friend.id === userId;
            listItemJSX = (
                  <List.Item
                        title={friend.name}
                        right={() => renderRightIcon("people", isCurrentUser)}
                        left={() => renderAvatar()}
                  />
            );
      } else if (props.type === "friends") {
            listItemJSX = (
                  <List.Item
                        title={friend.name}
                        right={() => renderRightIcon("friends", false)}
                        left={() => renderAvatar()}
                  />
            );
      } else if (props.type === "requests") {
            if (friend.sender_id == userId) {
                  listItemJSX = (
                        <List.Item
                              title={friend.name}
                              right={() => renderRightIcon("requests", false)}
                              left={() => renderAvatar()}
                        />
                  );
            } else {
                  listItemJSX = (
                        <List.Item
                              title={friend.name}
                              right={() => renderRightIcon("requests", false)}
                              left={() => renderAvatar()}
                        />
                  );
            }
      }

      return (
            <>
                  {listItemJSX}
                  <Modal
                        visible={showPfpModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowPfpModal(false)}
                  >
                        <Pressable
                              style={styles.modalOverlay}
                              onPress={() => setShowPfpModal(false)}
                        >
                              <Pressable onPress={(e) => e.stopPropagation()}>
                                    {fixedUrl && (
                                          <Image
                                                source={{ uri: fixedUrl }}
                                                style={styles.modalImage}
                                                resizeMode="contain"
                                          />
                                    )}
                              </Pressable>
                        </Pressable>
                  </Modal>
            </>
      );
}

const styles = StyleSheet.create({
      modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            alignItems: "center",
      },
      modalImage: {
            width: 300,
            height: 300,
            borderRadius: 8,
      },
});
