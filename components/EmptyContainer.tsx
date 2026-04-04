import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function EmptyContainer(emptyString: String) {
  return (
    <View style={styles.emptyContainer}>
      <Text>{emptyString as unknown as string}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    marginTop: 50,
    alignItems: "center",
  },
});
