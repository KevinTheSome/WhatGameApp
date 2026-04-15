import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';

interface PlayerListItemProps {
  id: string;
  name: string;
  isHost?: boolean;
  profilePictureUrl?: string;
}

const PlayerListItem: React.FC<PlayerListItemProps> = ({ id, name, isHost = false, profilePictureUrl }) => {
  const theme = useTheme();
  
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

  const fixedUrl = getFixedUrl(profilePictureUrl);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {fixedUrl ? (
        <Avatar.Image
          size={40}
          source={{ uri: fixedUrl }}
          style={styles.avatar}
        />
      ) : (
        <Avatar.Text 
          size={40} 
          label={name.charAt(0).toUpperCase()}
          style={styles.avatar}
          color={theme.colors.primary}
        />
      )}
      <View style={styles.textContainer}>
        <Text variant="titleMedium" numberOfLines={1}>
          {name} {isHost && '👑'}
        </Text>
        <Text variant="bodySmall" style={styles.id} numberOfLines={1}>
          ID: {id}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    elevation: 1,
  },
  avatar: {
    marginRight: 16,
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  id: {
    fontSize: 12,
    color: '#666',
  },
});

export default PlayerListItem;