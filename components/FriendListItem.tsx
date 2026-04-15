import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { Text, List, Button, useTheme, Avatar } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SecureStore from "@/utils/SecureStore";

export default function FriendListItem(props: any) {
  const theme = useTheme();
  const [friend, setFriend] = useState(props.friend);
  const [userId, setUserId] = useState<number | null>(null);

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
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, '');
      return url.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, baseUrl || '');
    }
    if (url.startsWith('/')) {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/api$/, '');
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const renderAvatar = () => {
    const fixedUrl = getFixedUrl(friend.profile_picture_url);
    if (fixedUrl) {
      return (
        <Avatar.Image
          size={40}
          source={{ uri: fixedUrl }}
          style={{ marginRight: 16, backgroundColor: "transparent" }}
        />
      );
    }
    return (
      <Avatar.Text 
        size={40} 
        label={friend.name.charAt(0).toUpperCase()}
        style={{
          marginRight: 16,
          backgroundColor: 'transparent',
        }}
        color={theme.colors.primary}
      />
    );
  };

  let listItemJSX = null;
  if (props.type === "people") {
    const isCurrentUser = friend.id === userId;
    listItemJSX = (
      <List.Item
        title={friend.name}
        right={(props) =>
          !isCurrentUser ? (
            <Ionicons
              name="person-add"
              size={24}
              color={theme.colors.onSurface}
            />
          ) : null
        }
        left={(props) => renderAvatar()}
        onPress={() => !isCurrentUser && props.handleAddFriend(friend)}
      />
    );
  } else if (props.type === "friends") {
    listItemJSX = (
      <List.Item
        title={friend.name}
        right={(props) => (
          <Ionicons
            name="person-remove"
            size={24}
            color={theme.colors.onSurface}
          />
        )}
        left={(props) => renderAvatar()}
        onPress={() => props.handleRemoveFriend(friend)}
      />
    );
  } else if (props.type === "requests") {
    if (friend.sender_id == userId) {
      listItemJSX = (
        <List.Item
          title={friend.name}
          right={(props) => (
            <Ionicons
              name="person-remove"
              size={24}
              color={theme.colors.onSurface}
            />
          )}
          left={(props) => renderAvatar()}
          onPress={() => props.handleRemoveFriend(friend)}
        />
      );
    } else {
      listItemJSX = (
        <List.Item
          title={friend.name}
          right={(props) => (
            <Ionicons
              name="person-add"
              size={24}
              color={theme.colors.onSurface}
            />
          )}
          left={(props) => renderAvatar()}
          onPress={() => props.handleAcceptFriend(friend)}
        />
      );
    }
  }

  return listItemJSX;
}
